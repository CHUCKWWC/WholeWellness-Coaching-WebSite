import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Admin routes are included in main routes file
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { initializeDigestScheduler } from "./digest-scheduler";
import { setupSecurity, securityErrorHandler } from "./security";
import { setupCsrfProtection } from "./csrf-protection";
import { requestLogger, errorLogger, log as logger } from "./logger";
import { errorHandler, notFoundHandler, successResponse } from "./error-handler";
import { performanceMonitor } from "./performance-monitor";
import cookieParser from "cookie-parser";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';

const app = express();

// Apply cookie parser first (required for CSRF)
app.use(cookieParser());

// Apply security middleware
setupSecurity(app);

// Apply CSRF protection
setupCsrfProtection(app);

// Register Stripe webhook route BEFORE express.json() - needs raw Buffer
app.post(
  '/api/stripe/webhook/:uuid',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      const { uuid } = req.params;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig, uuid);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// Add health check endpoint - only /health, not root
app.get('/health', (req: Request, res: Response) => {
  const healthStatus = performanceMonitor.getHealthStatus();
  const statusCode = healthStatus.status === 'healthy' ? 200 :
                    healthStatus.status === 'warning' ? 200 : 503;

  res.status(statusCode).json(successResponse({
    status: healthStatus.status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    performance: healthStatus
  }));
});

// Add performance metrics endpoint for admins
app.get('/admin/metrics', (req: Request, res: Response) => {
  // Basic auth check - in production you'd want proper admin authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const detailedReport = performanceMonitor.getDetailedReport();
  res.json(successResponse(detailedReport));
});

// Add request logging
app.use(requestLogger);

// Add performance monitoring
app.use(performanceMonitor.trackRequest);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create HTTP server first
const server = createServer(app);

// Use PORT environment variable for Cloud Run deployment, fallback to 5000 for development
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Start server immediately for health checks
server.listen(port, "0.0.0.0", () => {
  logger.info(`Server serving on port ${port}`, {
    port,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

// Initialize Stripe schema and sync data
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn('DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  try {
    logger.info('Initializing Stripe schema...');
    await runMigrations({ databaseUrl, schema: 'stripe' });
    logger.info('Stripe schema ready');

    const stripeSync = await getStripeSync();

    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const { webhook, uuid } = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
      { enabled_events: ['*'], description: 'Managed webhook for Stripe sync' }
    );
    logger.info(`Stripe webhook configured: ${webhook.url} (UUID: ${uuid})`);

    stripeSync.syncBackfill()
      .then(() => logger.info('Stripe data synced'))
      .catch((err: any) => logger.error('Error syncing Stripe data:', err));
  } catch (error) {
    logger.error('Failed to initialize Stripe:', error);
  }
}

// Initialize routes asynchronously after server is listening
(async () => {
  try {
    // Initialize Stripe integration
    await initStripe();

    // Register routes but don't wait for complex initialization
    await registerRoutes(app);

    // Admin routes are handled in registerRoutes

    // Initialize digest scheduler for automated email reminders
    initializeDigestScheduler();

    // Setup Vite or static serving BEFORE error handlers
    // This ensures frontend routes are handled before 404s
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Add security error handler
    app.use(securityErrorHandler);

    // Add error logging
    app.use(errorLogger);

    // Add 404 handler AFTER Vite setup
    app.use(notFoundHandler);

    // Add main error handler
    app.use(errorHandler);

    // Start performance monitoring
    performanceMonitor.startPeriodicLogging(300000); // Log every 5 minutes

    logger.info("Application fully initialized");
  } catch (error) {
    logger.error(`Error during initialization: ${error}`);
    // Don't exit the process - keep server running for health checks
  }
})();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
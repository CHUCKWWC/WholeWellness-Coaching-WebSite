import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Admin routes are included in main routes file
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

const app = express();

// Add health check endpoint - only /health, not root
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  log(`serving on port ${port}`);
});

// Initialize routes asynchronously after server is listening
(async () => {
  try {
    // Register routes but don't wait for complex initialization
    await registerRoutes(app);
    
    // Admin routes are handled in registerRoutes

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    log("Application fully initialized");
  } catch (error) {
    log(`Error during initialization: ${error}`);
    // Don't exit the process - keep server running for health checks
  }
})();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

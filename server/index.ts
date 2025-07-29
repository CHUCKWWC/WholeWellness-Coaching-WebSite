import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Admin routes are included in main routes file
import { setupVite, serveStatic, log } from "./vite";

const app = express();
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

(async () => {
  try {
    // Add startup timeout for Cloud Run deployment
    const startupTimeout = setTimeout(() => {
      console.error('Server startup timeout - terminating');
      process.exit(1);
    }, 30000); // 30 second timeout for startup

    const server = await registerRoutes(app);
    
    // Clear startup timeout once routes are registered
    clearTimeout(startupTimeout);
    
    // Global error handler - improved for production
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

      console.error('Server error:', err);
      res.status(status).json({ message });
    });

    // Setup Vite or static files based on environment
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Cloud Run optimized server configuration
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    const host = process.env.HOST || "0.0.0.0";
    
    server.listen({
      port,
      host,
      // Remove reusePort for Cloud Run compatibility
      ...(process.env.NODE_ENV === 'development' && { reusePort: true })
    }, () => {
      log(`Server ready on ${host}:${port} (${process.env.NODE_ENV || 'development'})`);
      
      // Signal that server is ready for health checks
      if (process.send) {
        process.send('ready');
      }
    });

    // Graceful shutdown handling for Cloud Run
    const gracefulShutdown = (signal: string) => {
      log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        log('HTTP server closed');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        log('Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

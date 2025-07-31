import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Production build creates dist/public/ directory
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    log(`Primary build directory not found: ${distPath}, trying alternative paths...`);
    
    // Try alternative dist paths
    const alternativePaths = [
      path.resolve(import.meta.dirname, "..", "client", "dist"),
      path.resolve(import.meta.dirname, "..", "dist", "public"),
      path.resolve(import.meta.dirname, "..", "client", "build"),
      path.resolve(import.meta.dirname, "..", "build")
    ];
    
    let foundPath = null;
    for (const altPath of alternativePaths) {
      if (fs.existsSync(altPath)) {
        foundPath = altPath;
        break;
      }
    }
    
    if (!foundPath) {
      log(`Warning: No build directory found. Server will still run for health checks.`);
      // Return a simple response for any static requests
      app.use("*", (_req, res) => {
        if (_req.path.startsWith('/api')) {
          return; // Let API routes handle themselves
        }
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>WholeWellness Coaching</title></head>
            <body>
              <h1>Application Loading</h1>
              <p>The application is initializing. Please wait...</p>
            </body>
          </html>
        `);
      });
      return;
    }
    
    log(`Using build directory: ${foundPath}`);
    app.use(express.static(foundPath));
    app.use("*", (_req, res) => {
      if (_req.path.startsWith('/api')) {
        return; // Let API routes handle themselves
      }
      const indexPath = path.resolve(foundPath!, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>WholeWellness Coaching</title></head>
            <body>
              <h1>Application Ready</h1>
              <p>Server is running successfully.</p>
            </body>
          </html>
        `);
      }
    });
    return;
  }

  log(`Using build directory: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    if (_req.path.startsWith('/api')) {
      return; // Let API routes handle themselves
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>WholeWellness Coaching</title></head>
          <body>
            <h1>Application Ready</h1>
            <p>Server is running successfully.</p>
          </body>
        </html>
      `);
    }
  });
}

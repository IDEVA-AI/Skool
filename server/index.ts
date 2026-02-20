import express, { type Request, Response, NextFunction, type Express } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Extend Express Request type to include rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Constants
const DEFAULT_PORT = 5000;
const DEFAULT_HOST = "0.0.0.0";
const API_PREFIX = "/api";

/**
 * Logger utility function
 */
export function log(message: string, source = "express"): void {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Configure Express middleware
 */
function setupMiddleware(app: Express): void {
  // JSON body parser with raw body capture
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  // URL-encoded body parser
  app.use(express.urlencoded({ extended: false }));
}

/**
 * Setup request logging middleware
 */
function setupRequestLogging(app: Express): void {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    // Capture JSON response for logging
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson as Record<string, unknown>;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    // Log API requests after response finishes
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith(API_PREFIX)) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });

    next();
  });
}

/**
 * Setup error handling middleware
 */
function setupErrorHandling(app: Express): void {
  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });
}

/**
 * Setup client serving (Vite in dev, static files in production)
 */
async function setupClientServing(httpServer: Server, app: Express): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
}

/**
 * Get port from environment or use default
 */
function getPort(): number {
  const port = process.env.PORT;
  return port ? parseInt(port, 10) : DEFAULT_PORT;
}

/**
 * Start the HTTP server
 */
function startServer(httpServer: Server, port: number): void {
  httpServer.listen(port, DEFAULT_HOST, () => {
    log(`serving on port ${port}`);
  });
}

/**
 * Initialize and start the Express server
 */
async function initializeServer(): Promise<void> {
  const app = express();
  const httpServer = createServer(app);

  // Carregar variáveis de ambiente
  dotenv.config({ path: path.join(process.cwd(), ".env.local") });

  // Setup middleware
  setupMiddleware(app);
  setupRequestLogging(app);

  // Register API routes
  await registerRoutes(httpServer, app);

  // Setup error handling (after routes)
  setupErrorHandling(app);

  // Setup client serving (after routes to avoid catch-all interference)
  await setupClientServing(httpServer, app);

  // Start server
  const port = getPort();
  startServer(httpServer, port);
}

// Start the server
initializeServer().catch((error) => {
  log(`Failed to start server: ${error.message}`, "error");
  process.exit(1);
});

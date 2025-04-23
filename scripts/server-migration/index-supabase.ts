import express, { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes-supabase";

async function main() {
  const app = express();
  
  // Use storage-supabase instead of the original storage
  require("./storage-supabase");

  // Log all requests
  app.use((req, _res, next) => {
    log(`${req.method} ${req.path}`);
    next();
  });

  // Parse JSON body
  app.use(express.json());

  // Register routes (API endpoints)
  const httpServer = await registerRoutes(app);

  // Handle unhandled errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);

    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: fromZodError(err).message 
      });
    }

    return res.status(500).json({
      error: err.message || "Internal server error"
    });
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
}

main().catch(console.error);
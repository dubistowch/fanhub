import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// 确保Supabase数据库URL格式正确 - 修复可能的双@问题
if (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.includes('@@')) {
  // 从URL中提取组件并重建URL
  try {
    const connectionUrl = process.env.SUPABASE_DB_URL;
    const match = connectionUrl.match(/postgresql:\/\/([^:]+):([^@]+)@?@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [_, username, password, host, port, database] = match;
      // 移除密码中可能存在的@符号或编码它
      const cleanPassword = password.replace(/@/g, '%40');
      
      const fixedUrl = `postgresql://${username}:${cleanPassword}@${host}:${port}/${database}`;
      console.log("已修复SUPABASE_DB_URL中的双@符号问题");
      
      // 更新环境变量
      process.env.SUPABASE_DB_URL = fixedUrl;
    }
  } catch (err) {
    console.error("尝试修复SUPABASE_DB_URL失败:", err);
  }
}

// 将修复后的URL同步到DATABASE_URL环境变量
if (process.env.SUPABASE_DB_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DB_URL;
}

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
  const server = await registerRoutes(app);

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

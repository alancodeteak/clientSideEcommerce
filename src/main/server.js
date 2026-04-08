// Purpose: This file creates and configures the Express app with middleware, routes, and error handlers.
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { createRoutes } from "../interface/http/routes/index.js";
import { notFound } from "../interface/http/middleware/notFound.js";
import { errorHandler } from "../interface/http/middleware/errorHandler.js";
import { createAppContext } from "./composition.js";

export function createExpressApp(ctx) {
  const isNoisePath = (url) => url === "/health" || url === "/";

  const app = express();

  app.disable("x-powered-by");
  app.use(
    pinoHttp({
      logger,
      quietReqLogger: true,
      genReqId(req, res) {
        const incoming = req.headers["x-request-id"];
        const requestId =
          typeof incoming === "string" && incoming.trim() ? incoming.trim() : randomUUID();
        res.setHeader("x-request-id", requestId);
        return requestId;
      },
      autoLogging: {
        ignore(req) {
          return isNoisePath(req.url) || req.method === "OPTIONS";
        }
      },
      customLogLevel(req, res, err) {
        if (isNoisePath(req.url)) return "silent";
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      customSuccessMessage(req, res) {
        return isNoisePath(req.url) ? "health.check" : "api.request.completed";
      },
      customErrorMessage() {
        return "api.request.completed";
      },
      customSuccessObject(req, res, val) {
        return {
          event: "api.request.completed",
          requestId: req.id,
          method: req.method,
          route: req.route?.path || req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Math.round(Number(val) || 0),
          shopId: req.shopId,
          userId: req.customerAuth?.userId,
          customerId: req.customerAuth?.customerId
        };
      },
      customErrorObject(req, res, err, val) {
        return {
          event: "api.request.completed",
          requestId: req.id,
          method: req.method,
          route: req.route?.path || req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Math.round(Number(val) || 0),
          shopId: req.shopId,
          userId: req.customerAuth?.userId,
          customerId: req.customerAuth?.customerId,
          err: err?.message
        };
      }
    })
  );
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  app.use(ctx.shopResolver);
  app.use(createRoutes(ctx));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export function createServer() {
  const ctx = createAppContext();
  return createExpressApp(ctx);
}

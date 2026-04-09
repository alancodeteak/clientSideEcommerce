// Purpose: Build express-rate-limit instances with shared options and the same 429 JSON body.

import rateLimit from "express-rate-limit";
import { env } from "../../../config/env.js";
import { sendTooManyRequests } from "../responses/httpResponses.js";

/**
 * @param {{ windowMs: number, maxTest: number, maxProd: number, message: string }} opts
 */
export function createLimiter({ windowMs, maxTest, maxProd, message }) {
  return rateLimit({
    windowMs,
    max: env.NODE_ENV === "test" ? maxTest : maxProd,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => sendTooManyRequests(res, message)
  });
}

import { AppError } from "../../../domain/errors/AppError.js";
import { logger } from "../../../config/logger.js";

/** express.json() / body-parser: invalid JSON body (e.g. trailing character in Postman raw body). */
function isMalformedJsonBody(err) {
  return (
    err instanceof SyntaxError &&
    (err.status === 400 || err.statusCode === 400) &&
    typeof err.body === "string"
  );
}

export function errorHandler(err, _req, res, _next) {
  if (isMalformedJsonBody(err)) {
    logger.warn({ err: err.message }, "Invalid JSON body");
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message:
          "Request body is not valid JSON. Remove stray characters after the final `}` (common in Postman raw body)."
      }
    });
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  if (!isAppError) {
    logger.error({ err }, "Unhandled error");
  }

  res.status(statusCode).json({
    error: {
      code: isAppError ? err.code : "INTERNAL_ERROR",
      message: isAppError ? err.message : "Something went wrong",
      details: isAppError ? err.details : undefined
    }
  });
}

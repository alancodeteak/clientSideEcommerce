import { AppError } from "./AppError.js";

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", details) {
    super(message, { statusCode: 503, code: "SERVICE_UNAVAILABLE", details });
  }
}

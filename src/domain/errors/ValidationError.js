import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR", details });
  }
}

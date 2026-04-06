import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details) {
    super(message, { statusCode: 403, code: "FORBIDDEN", details });
  }
}

import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message = "Conflict", details) {
    super(message, { statusCode: 409, code: "CONFLICT", details });
  }
}

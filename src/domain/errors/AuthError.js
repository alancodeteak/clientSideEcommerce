import { AppError } from "./AppError.js";

export class AuthError extends AppError {
  constructor(message = "Unauthorized", details) {
    super(message, { statusCode: 401, code: "UNAUTHORIZED", details });
  }
}

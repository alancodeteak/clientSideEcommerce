import { ZodError } from "zod";
import { ValidationError } from "../../../domain/errors/ValidationError.js";

export function validate({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ValidationError("Invalid request", err.flatten()));
      } else {
        next(err);
      }
    }
  };
}

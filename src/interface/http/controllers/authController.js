import { env } from "../../../config/env.js";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError.js";
import { withClient, withTx } from "../../../infra/db/tx.js";

export const authController = {
  register: (ctx) => async (req, res, next) => {
    try {
      const result = await withTx((client) => ctx.registerCustomer(client, req.body));
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  login: (ctx) => async (req, res, next) => {
    try {
      const result = await withClient((client) => ctx.loginCustomer(client, req.body));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  oauthJwt: (ctx) => async (req, res, next) => {
    try {
      if (!env.ALLOW_EMAIL_ONLY_JWT_EXCHANGE) {
        throw new ForbiddenError(
          "Email-only JWT exchange is disabled. Use email/password login or set ALLOW_EMAIL_ONLY_JWT_EXCHANGE only in trusted non-production environments."
        );
      }
      const result = await withClient((client) => ctx.exchangeOAuthSessionForJwt(client, req.body.email));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

import { env } from "../../../config/env.js";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError.js";
import { ValidationError } from "../../../domain/errors/ValidationError.js";
import { withClient, withTx } from "../../../infra/db/tx.js";
import { oauthExchangeCookieOptions, verifyOAuthExchangeCookie } from "../../../infra/oauth/oauthExchangeCookie.js";
import { CART_SESSION_COOKIE } from "../../../application/services/storefront/storefrontCart.js";

/**
 * Purpose: This file handles authentication HTTP endpoints.
 * It runs register/login/oauth-jwt flows, merges guest cart data
 * after sign-in, and clears auth-related cookies on logout.
 */
export const authController = {
  register: (ctx) => async (req, res, next) => {
    try {
      const result = await withTx(async (client) => {
        const out = await ctx.registerCustomer(client, req.body);
        await ctx.mergeGuestCart(client, {
          shopId: req.body.shopId,
          sessionId: req.cookies?.[CART_SESSION_COOKIE],
          customerId: out.customer.id
        });
        return out;
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  login: (ctx) => async (req, res, next) => {
    try {
      const result = await withClient(async (client) => {
        const out = await ctx.loginCustomer(client, req.body);
        const shopId =
          req.body.shopId ?? (Array.isArray(out.shopIds) && out.shopIds.length === 1 ? out.shopIds[0] : undefined);
        await ctx.mergeGuestCart(client, {
          shopId,
          sessionId: req.cookies?.[CART_SESSION_COOKIE],
          customerId: out.customer.id
        });
        return out;
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  oauthJwt: (ctx) => async (req, res, next) => {
    const cookieOpts = oauthExchangeCookieOptions();
    try {
      const rawCookie = req.cookies?.storefront_oauth_exchange;
      if (rawCookie) {
        try {
          const payload = verifyOAuthExchangeCookie(rawCookie);
          const result = await withClient(async (client) => {
            const out = await ctx.buildStorefrontSessionResponse(client, payload.sub);
            const shopId =
              req.body.shopId ??
              (Array.isArray(out.shopIds) && out.shopIds.length === 1 ? out.shopIds[0] : undefined);
            await ctx.mergeGuestCart(client, {
              shopId,
              sessionId: req.cookies?.[CART_SESSION_COOKIE],
              customerId: out.customer.id
            });
            return out;
          });
          res.clearCookie("storefront_oauth_exchange", cookieOpts);
          return res.json(result);
        } catch {
          res.clearCookie("storefront_oauth_exchange", cookieOpts);
          const canFallBackToEmail =
            env.ALLOW_EMAIL_ONLY_JWT_EXCHANGE && Boolean(req.body?.email);
          if (!canFallBackToEmail) {
            return res.status(401).json({
              error: {
                code: "UNAUTHORIZED",
                message:
                  "OAuth exchange cookie expired or invalid. Complete Google sign-in again."
              }
            });
          }
        }
      }

      if (!env.ALLOW_EMAIL_ONLY_JWT_EXCHANGE) {
        throw new ForbiddenError(
          "JWT exchange requires a Google sign-in cookie or enable ALLOW_EMAIL_ONLY_JWT_EXCHANGE only in trusted non-production environments."
        );
      }
      const email = req.body.email;
      if (!email) {
        throw new ValidationError(
          "email is required for email-only JWT exchange (or complete Google OAuth and send storefront_oauth_exchange cookie)."
        );
      }
      const result = await withClient(async (client) => {
        const out = await ctx.exchangeOAuthSessionForJwt(client, email);
        const shopId =
          req.body.shopId ??
          (Array.isArray(out.shopIds) && out.shopIds.length === 1 ? out.shopIds[0] : undefined);
        await ctx.mergeGuestCart(client, {
          shopId,
          sessionId: req.cookies?.[CART_SESSION_COOKIE],
          customerId: out.customer.id
        });
        return out;
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  logout: () => async (_req, res, next) => {
    try {
      const cookieOpts = oauthExchangeCookieOptions();
      res.clearCookie(CART_SESSION_COOKIE, { path: "/", sameSite: "lax" });
      res.clearCookie("storefront_oauth_exchange", cookieOpts);
      res.clearCookie("storefront_serviceability", { path: "/", sameSite: "lax" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};

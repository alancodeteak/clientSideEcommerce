import { withClient, withTx } from "../../../infra/db/tx.js";
import { oauthExchangeCookieOptions, verifyOAuthExchangeCookie } from "../../../infra/oauth/oauthExchangeCookie.js";
import { logSecurityEvent } from "../../../infra/logging/apiLog.js";

/**
 * Purpose: This file handles authentication HTTP endpoints.
 * OAuth JWT exchange and OTP login handlers.
 */
function oauthJwtHandler(ctx) {
  return async (req, res, next) => {
    const cookieOpts = oauthExchangeCookieOptions();
    try {
      const rawCookie = req.cookies?.storefront_oauth_exchange;
      if (rawCookie) {
        try {
          const payload = verifyOAuthExchangeCookie(rawCookie);
          const result = await withClient((client) =>
            ctx.buildStorefrontSessionResponse(client, payload.sub, {
              ip: req.ip,
              userAgent: req.get("user-agent") || null
            })
          );
          res.clearCookie("storefront_oauth_exchange", cookieOpts);
          return res.json(result);
        } catch {
          res.clearCookie("storefront_oauth_exchange", cookieOpts);
          return res.status(401).json({
            error: {
              code: "UNAUTHORIZED",
              message:
                "OAuth exchange cookie expired or invalid. Complete Google sign-in again."
            }
          });
        }
      }
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing storefront_oauth_exchange cookie. Complete Google sign-in first."
        }
      });
    } catch (err) {
      next(err);
    }
  };
}

function otpRequestHandler(ctx) {
  return async (req, res, next) => {
    try {
      const out = await withClient((client) => ctx.requestCustomerOtp(client, req.body));
      logSecurityEvent("otp.requested", req, { phone: req.body?.phone ? "provided" : "missing" });
      res.json(out);
    } catch (err) {
      next(err);
    }
  };
}

function otpVerifyHandler(ctx) {
  return async (req, res, next) => {
    try {
      const out = await withTx((client) =>
        ctx.verifyCustomerOtp(client, {
          ...req.body,
          ip: req.ip,
          userAgent: req.get("user-agent") || null
        })
      );
      logSecurityEvent("otp.verified", req);
      res.json(out);
    } catch (err) {
      next(err);
    }
  };
}

export const authController = {
  otpRequest: (ctx) => otpRequestHandler(ctx),
  otpVerify: (ctx) => otpVerifyHandler(ctx),
  oauthJwt: (ctx) => oauthJwtHandler(ctx),

  forCtx(ctx) {
    return {
      otpRequest: otpRequestHandler(ctx),
      otpVerify: otpVerifyHandler(ctx),
      oauthJwt: oauthJwtHandler(ctx)
    };
  }
};

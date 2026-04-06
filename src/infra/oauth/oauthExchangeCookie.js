import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function oauthExchangeCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 900_000
  };
}

/**
 * @param {string} userId
 */
export function signOAuthExchangeCookie(userId) {
  return jwt.sign(
    { sub: userId, typ: "oauth_exch" },
    env.JWT_SECRET,
    {
      issuer: env.JWT_ISSUER,
      audience: "storefront-oauth-exchange",
      expiresIn: "15m"
    }
  );
}

/**
 * @param {string} token
 * @returns {{ sub: string }}
 */
export function verifyOAuthExchangeCookie(token) {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: "storefront-oauth-exchange"
  });
  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Invalid exchange token");
  }
  return /** @type {{ sub: string }} */ (payload);
}

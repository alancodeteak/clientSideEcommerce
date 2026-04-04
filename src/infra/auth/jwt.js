import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

/**
 * @param {{ userId: string, customerId: string, shopId?: string|null, role?: string }} claims
 * `shopId` is set on register; login (email-only) issues a token without `shopId`.
 */
export function signCustomerAccessToken({ userId, customerId, shopId, role = "customer" }) {
  const payload = { sub: userId, customerId, role };
  if (shopId != null && shopId !== "") {
    payload.shopId = shopId;
  }
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

export function verifyCustomerAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
}

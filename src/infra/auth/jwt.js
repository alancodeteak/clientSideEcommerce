import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

/**
 * @param {{ userId: string, customerId: string, shopId?: string|null, role?: string }} claims
 * `shopId` is set on register for the target shop. Login / JWT exchange also set it when the
 * customer has exactly one active membership; otherwise omit so callers use `shopIds` + catalog headers.
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

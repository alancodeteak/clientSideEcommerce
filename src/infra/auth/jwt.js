import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

/**
 * @param {{ userId: string, shopId: string, customerId: string, role?: string }} claims
 */
export function signCustomerAccessToken({ userId, shopId, customerId, role = "customer" }) {
  return jwt.sign(
    { sub: userId, shopId, customerId, role },
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

import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";

/**
 * Purpose: This file creates and verifies JWT access tokens.
 * It signs and verifies customer access tokens for this API.
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
      algorithm: "HS256",
      keyid: env.JWT_KEY_ID,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN || env.JWT_EXPIRES_IN
    }
  );
}

export function verifyCustomerAccessToken(token) {
  const verifyOptions = {
    algorithms: env.JWT_ALLOWED_ALGORITHMS,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  };
  try {
    return jwt.verify(token, env.JWT_SECRET, verifyOptions);
  } catch (err) {
    if (!env.JWT_PREVIOUS_SECRET) throw err;
    return jwt.verify(token, env.JWT_PREVIOUS_SECRET, verifyOptions);
  }
}

export function signCustomerRefreshToken({ userId, customerId }) {
  const jti = randomUUID();
  const token = jwt.sign(
    { sub: userId, customerId, typ: "refresh" },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: "HS256",
      keyid: env.JWT_KEY_ID,
      issuer: env.JWT_ISSUER,
      audience: `${env.JWT_AUDIENCE}:refresh`,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      jwtid: jti
    }
  );
  return { token, jti };
}

export function verifyCustomerRefreshToken(token) {
  const verifyOptions = {
    algorithms: env.JWT_ALLOWED_ALGORITHMS,
    issuer: env.JWT_ISSUER,
    audience: `${env.JWT_AUDIENCE}:refresh`
  };
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET, verifyOptions);
  } catch (err) {
    if (!env.JWT_PREVIOUS_REFRESH_SECRET) throw err;
    payload = jwt.verify(token, env.JWT_PREVIOUS_REFRESH_SECRET, verifyOptions);
  }
  if (typeof payload === "string" || payload.typ !== "refresh" || !payload.jti) {
    throw new Error("Invalid refresh token");
  }
  return payload;
}

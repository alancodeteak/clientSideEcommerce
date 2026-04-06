import { createHmac, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";

/**
 * @param {{ shopId?: string|null, callbackURL?: string|null, disableRedirect?: boolean }} input
 */
export function createOAuthStatePayload(input) {
  return {
    n: randomBytes(16).toString("hex"),
    shopId: input.shopId ?? null,
    callbackURL: input.callbackURL ?? null,
    dr: !!input.disableRedirect
  };
}

/**
 * @param {Record<string, unknown>} payload
 */
export function signOAuthState(payload) {
  const p = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", env.JWT_SECRET).update(p).digest("base64url");
  return `${p}.${sig}`;
}

/**
 * @param {string|undefined} state
 * @returns {null | ReturnType<typeof createOAuthStatePayload>}
 */
export function verifyOAuthState(state) {
  if (!state || typeof state !== "string") return null;
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const p = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac("sha256", env.JWT_SECRET).update(p).digest("base64url");
  if (sig !== expected || !sig) return null;
  try {
    return JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

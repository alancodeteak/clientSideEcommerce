import { env } from "../../config/env.js";

export function assertGoogleOAuthConfigured() {
  const id = env.GOOGLE_CLIENT_ID?.trim();
  const secret = env.GOOGLE_CLIENT_SECRET?.trim();
  if (!id || !secret) {
    return null;
  }
  return { id, secret };
}

/**
 * @param {string} signedState — `signOAuthState` output
 */
export function buildGoogleAuthorizationUrl(signedState) {
  const cfg = assertGoogleOAuthConfigured();
  if (!cfg) return null;
  const base = env.API_PUBLIC_URL.replace(/\/$/, "");
  const redirectUri = `${base}/api/oauth/callback/google`;
  const u = new URL(env.GOOGLE_OAUTH_AUTH_URL);
  u.searchParams.set("client_id", cfg.id);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", env.GOOGLE_OAUTH_SCOPE);
  u.searchParams.set("state", signedState);
  u.searchParams.set("access_type", "online");
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

/**
 * @param {string} code
 */
export async function exchangeGoogleAuthorizationCode(code) {
  const cfg = assertGoogleOAuthConfigured();
  if (!cfg) {
    throw new Error("Google OAuth is not configured");
  }
  const base = env.API_PUBLIC_URL.replace(/\/$/, "");
  const redirectUri = `${base}/api/oauth/callback/google`;
  const body = new URLSearchParams({
    code,
    client_id: cfg.id,
    client_secret: cfg.secret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });
  const res = await fetch(env.GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Google token error: ${res.status} ${t}`);
  }
  /** @type {{ access_token?: string }} */
  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Google token response missing access_token");
  }
  return data.access_token;
}

/**
 * @param {string} accessToken
 */
export async function fetchGoogleUserInfo(accessToken) {
  const res = await fetch(env.GOOGLE_OAUTH_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`Google userinfo error: ${res.status}`);
  }
  /** @type {{ email?: string, email_verified?: boolean, name?: string, given_name?: string }} */
  return res.json();
}

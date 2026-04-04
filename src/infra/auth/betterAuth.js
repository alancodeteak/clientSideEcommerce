import { betterAuth } from "better-auth";
import { env } from "../../config/env.js";
import { pool } from "../db/pool.js";

const googleConfigured =
  Boolean(env.GOOGLE_CLIENT_ID?.trim()) && Boolean(env.GOOGLE_CLIENT_SECRET?.trim());

/**
 * Better Auth instance (Google OAuth). Mounted at {@link env.BETTER_AUTH_BASE_PATH}.
 *
 * Email/password remains on legacy `POST /api/auth/register` and `POST /api/auth/login` (JWT).
 */
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: env.BETTER_AUTH_BASE_PATH,
  database: pool,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: false
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          prompt: "select_account"
        }
      }
    : {}
});

export const isGoogleOAuthConfigured = googleConfigured;

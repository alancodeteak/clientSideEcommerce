import { AuthError } from "../../../domain/errors/AuthError.js";
import { buildStorefrontSessionResponse } from "./buildStorefrontSessionResponse.js";

/**
 * Compatibility / dev-only: generate storefront JWT from email when explicitly allowed,
 * or use `POST /api/auth/oauth/jwt` with the cookie set by `GET /api/oauth/callback/google`.
 * Uses only canonical schema tables (`users`, `customers`, memberships, shops).
 */
export function exchangeOAuthSessionForJwt({ authRepo }) {
  return async function execute(client, email) {
    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) {
      throw new AuthError("No storefront profile for this account");
    }

    return buildStorefrontSessionResponse(authRepo, client, user.id);
  };
}

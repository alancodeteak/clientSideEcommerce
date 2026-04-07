import { AuthError } from "../../../domain/errors/AuthError.js";
import { verifyPassword } from "../../../infra/security/passwordHasher.js";
import { buildStorefrontSessionResponse } from "./buildStorefrontSessionResponse.js";

/**
 * Purpose: Sign in with email and password and return a JWT plus shop memberships and profile rows.
 */
export function loginCustomer({ authRepo }) {
  return async function execute(client, input) {
    const { email, password } = input;

    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) {
      throw new AuthError("Invalid credentials");
    }

    if (!user.password_hash) {
      throw new AuthError("Invalid credentials");
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      throw new AuthError("Invalid credentials");
    }

    return buildStorefrontSessionResponse(authRepo, client, user.id);
  };
}

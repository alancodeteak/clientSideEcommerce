import { AuthError } from "../../../domain/errors/AuthError.js";
import { verifyPassword } from "../../../infra/security/passwordHasher.js";
import { signCustomerAccessToken } from "../../../infra/auth/jwt.js";
import { buildProfileFromShops } from "./customerProfile.js";

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

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      throw new AuthError("Invalid credentials");
    }

    const customer = await authRepo.getCustomerByUserId(client, user.id);
    if (!customer || customer.is_blocked || customer.is_deleted) {
      throw new AuthError("Invalid credentials");
    }

    const shops = await authRepo.listActiveShopsForCustomer(client, customer.id);
    const shopIds = shops.map((s) => s.id);
    const profile = buildProfileFromShops(customer, shops);

    const accessToken = signCustomerAccessToken({
      userId: user.id,
      customerId: customer.id,
      shopId: shopIds.length === 1 ? shopIds[0] : undefined
    });

    return {
      accessToken,
      role: "customer",
      user: {
        id: user.id,
        email: user.email,
        registrationSource: user.registration_source
      },
      customer: { id: customer.id },
      shopIds,
      profile
    };
  };
}

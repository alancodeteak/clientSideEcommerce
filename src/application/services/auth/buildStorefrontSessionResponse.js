import { AuthError } from "../../../domain/errors/AuthError.js";
import { signCustomerAccessToken } from "../../../infra/auth/jwt.js";
import { buildProfileFromShops } from "./customerProfile.js";

/**
 * Build the same JSON body as successful `login` / OAuth completion (JWT + profile + shopIds).
 * @param {import("../../ports/repositories/CustomerAuthRepo.js").CustomerAuthRepo} authRepo
 * @param {import("pg").PoolClient} client
 * @param {string} userId
 */
export async function buildStorefrontSessionResponse(authRepo, client, userId, sessionMeta = {}) {
  void sessionMeta;
  const user = await authRepo.getUserById(client, userId);
  if (!user || !user.is_active) {
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
}

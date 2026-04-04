import { AuthError } from "../../../domain/errors/AuthError.js";
import { verifyPassword } from "../../../infra/security/passwordHasher.js";
import { signCustomerAccessToken } from "../../../infra/auth/jwt.js";
import { shopAllowsCustomers } from "./shopPolicy.js";

/**
 * @param {{ authRepo: import("../../ports/repositories/CustomerAuthRepo.js").CustomerAuthRepo }} deps
 */
export function loginCustomer({ authRepo }) {
  /**
   * @param {import("pg").PoolClient} client
   * @param {{ shopSlug?: string, shopId?: string, email: string, password: string }} input
   */
  return async function execute(client, input) {
    const { shopSlug, shopId, email, password } = input;

    const shop = shopId
      ? await authRepo.getShopById(client, shopId)
      : await authRepo.getShopBySlug(client, shopSlug ?? "");

    if (!shopAllowsCustomers(shop)) {
      throw new AuthError("Invalid credentials");
    }

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

    const membership = await authRepo.getMembershipByCustomerAndShop(client, customer.id, shop.id);
    if (!membership || !membership.is_active || membership.is_blocked || membership.is_deleted) {
      throw new AuthError("Invalid credentials");
    }

    const accessToken = signCustomerAccessToken({
      userId: user.id,
      shopId: shop.id,
      customerId: customer.id
    });

    return {
      accessToken,
      role: "customer",
      user: { id: user.id, email: user.email },
      shop: { id: shop.id, slug: shop.slug, name: shop.name },
      customer: { id: customer.id }
    };
  };
}

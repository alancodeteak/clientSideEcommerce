import { AuthError } from "../../../domain/errors/AuthError.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";
import { ValidationError } from "../../../domain/errors/ValidationError.js";
import { shopAllowsCustomers } from "./shopPolicy.js";

/**
 * Upsert storefront user/customer and optional shop membership after Google verified email.
 * Unlike `registerCustomer`, an already-active membership is success (sign-in).
 * @param {{ authRepo: import("../../ports/repositories/CustomerAuthRepo.js").CustomerAuthRepo }} deps
 */
export function provisionCustomerForOAuthShop({ authRepo }) {
  /**
   * @param {import("pg").PoolClient} client
   * @param {{ email: string, displayName: string|null, shopId?: string|undefined }} input
   */
  return async function execute(client, input) {
    const { email, displayName, shopId } = input;

    let user = await authRepo.getUserByEmail(client, email);
    if (!user) {
      user = await authRepo.insertUser(client, { email, password_hash: null });
    } else if (!user.is_active) {
      throw new AuthError("Invalid credentials");
    }

    let customer = await authRepo.getCustomerByUserId(client, user.id);
    if (!customer) {
      customer = await authRepo.insertCustomer(client, {
        user_id: user.id,
        display_name: displayName
      });
    } else if (customer.is_blocked || customer.is_deleted) {
      throw new AuthError("Invalid credentials");
    }

    let shop = null;
    if (shopId) {
      shop = await authRepo.getShopById(client, shopId);
      if (!shop) {
        throw new NotFoundError("Shop not found");
      }
      if (!shopAllowsCustomers(shop)) {
        throw new ValidationError("Shop is not available");
      }

      const membership = await authRepo.getMembershipByCustomerAndShop(client, customer.id, shop.id);
      if (!membership) {
        await authRepo.insertMembership(client, {
          shop_id: shop.id,
          customer_id: customer.id
        });
      } else if (membership.is_blocked) {
        throw new AuthError("Invalid credentials");
      } else if (!membership.is_active || membership.is_deleted) {
        await authRepo.reactivateMembership(client, membership.id);
      }
    }

    return { user, customer, shop };
  };
}

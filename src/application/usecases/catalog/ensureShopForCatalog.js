import { pool } from "../../../infra/db/pool.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";
import { ValidationError } from "../../../domain/errors/ValidationError.js";
import { shopAllowsCustomers } from "../auth/shopPolicy.js";

/**
 * Purpose: Ensure catalog reads only run for shops that exist and accept storefront customers.
 * @param {{ authRepo: import("../../ports/repositories/CustomerAuthRepo.js").CustomerAuthRepo }} deps
 */
export function createEnsureShopForCatalog({ authRepo }) {
  return async function ensureShopForCatalog(shopId) {
    const client = await pool.connect();
    try {
      const shop = await authRepo.getShopById(client, shopId);
      if (!shop) {
        throw new NotFoundError("Shop not found");
      }
      if (!shopAllowsCustomers(shop)) {
        throw new ValidationError("Shop is not available");
      }
    } finally {
      client.release();
    }
  };
}

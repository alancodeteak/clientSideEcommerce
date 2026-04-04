import { CatalogRepo } from "../../../application/ports/repositories/CatalogRepo.js";
import { pool } from "../../../infra/db/pool.js";
import { setTenantContext } from "../../../infra/db/tenantContext.js";

export class CatalogRepoPg extends CatalogRepo {
  /**
   * Lists active products for the current tenant (RLS enforced via `app.current_shop_id`).
   * @param {string} shopId
   */
  async list(shopId) {
    const client = await pool.connect();
    try {
      await setTenantContext(client, shopId);
      const { rows } = await client.query(
        `SELECT id, shop_id, category_id, name, slug, base_unit, status, price_minor_per_unit::text AS price_minor_per_unit,
                created_at, updated_at
           FROM products
          WHERE status = 'active'
          ORDER BY name ASC
          LIMIT 200`
      );
      return rows;
    } finally {
      client.release();
    }
  }
}

import { requireShopId, parseOptionalUuidParam } from "./catalogShopId.js";

/**
 * @param {{
 *   catalogRepo: import("../../ports/repositories/CatalogRepo.js").CatalogRepo,
 *   ensureShopForCatalog: Function
 * }} deps
 */
export function createListProducts({ catalogRepo, ensureShopForCatalog }) {
  /**
   * @param {string|undefined} shopId
   * @param {{ categoryId?: string|null }} query
   */
  return async function listProducts(shopId, query = {}) {
    const id = requireShopId(shopId);
    const categoryId = parseOptionalUuidParam(query.categoryId);
    await ensureShopForCatalog(id);
    return catalogRepo.listProducts(id, { categoryId });
  };
}

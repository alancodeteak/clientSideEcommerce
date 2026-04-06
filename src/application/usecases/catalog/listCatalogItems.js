import { requireShopId } from "./catalogShopId.js";

/**
 * Backward-compatible alias: lists active products (same as listProducts without category filter).
 * @param {{
 *   catalogRepo: import("../../ports/repositories/CatalogRepo.js").CatalogRepo,
 *   ensureShopForCatalog: Function
 * }} deps
 */
export function createListCatalogItems({ catalogRepo, ensureShopForCatalog }) {
  return async function listCatalogItems(shopId) {
    const id = requireShopId(shopId);
    await ensureShopForCatalog(id);
    return catalogRepo.listProducts(id, {});
  };
}
 
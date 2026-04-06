import { requireShopId, parseOptionalUuidParam } from "./catalogShopId.js";

/**
 * @param {{
 *   catalogRepo: import("../../ports/repositories/CatalogRepo.js").CatalogRepo,
 *   ensureShopForCatalog: Function
 * }} deps
 */
export function createListCategories({ catalogRepo, ensureShopForCatalog }) {
  /**
   * @param {string|undefined} shopId
   * @param {{ parentId?: string|null }} query — omit/null/empty: root categories; UUID: children of parent
   */
  return async function listCategories(shopId, query = {}) {
    const id = requireShopId(shopId);
    const parentId = parseOptionalUuidParam(query.parentId);
    await ensureShopForCatalog(id);
    return catalogRepo.listCategories(id, { parentId });
  };
}

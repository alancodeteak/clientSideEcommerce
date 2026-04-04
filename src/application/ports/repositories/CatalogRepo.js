/**
 * @typedef {Object} CatalogItem
 * @property {string} id
 * @property {string} shop_id
 * @property {string|null} category_id
 * @property {string} name
 * @property {string} slug
 * @property {string} base_unit
 * @property {string} status
 * @property {string} price_minor_per_unit
 * @property {string} created_at
 * @property {string} updated_at
 */

export class CatalogRepo {
  /**
   * @param {string} shopId
   * @returns {Promise<CatalogItem[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async list(shopId) {
    throw new Error("Not implemented");
  }
}

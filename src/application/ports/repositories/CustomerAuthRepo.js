/**
 * @typedef {Object} ShopRow
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {boolean} is_active
 * @property {string} status
 * @property {boolean} is_blocked
 * @property {boolean} is_deleted
 */

/**
 * @typedef {Object} UserRow
 * @property {string} id
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} password_hash
 * @property {'password'|'google'} registration_source Derived: `google` when `password_hash` is null, else `password`.
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} CustomerRow
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} display_name
 * @property {boolean} is_blocked
 * @property {boolean} is_deleted
 */

/**
 * @typedef {Object} MembershipRow
 * @property {string} id
 * @property {string} shop_id
 * @property {string} customer_id
 * @property {boolean} is_active
 * @property {boolean} is_blocked
 * @property {boolean} is_deleted
 */

export class CustomerAuthRepo {
  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _shopId
   * @returns {Promise<ShopRow|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getShopById(_client, _shopId) {
    throw new Error("Not implemented");
  }

  /**
   * Whether JWT bearer `sub` + `customerId` still refer to an active user + customer (not blocked).
   * @param {string} _userId
   * @param {string} _customerId
   * @returns {Promise<boolean>}
   */
  // eslint-disable-next-line no-unused-vars
  async isCustomerSessionValid(_userId, _customerId) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _userId
   * @returns {Promise<UserRow|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getUserById(_client, _userId) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _email
   * @returns {Promise<UserRow|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getUserByEmail(_client, _email) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _userId
   * @returns {Promise<CustomerRow|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getCustomerByUserId(_client, _userId) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _customerId
   * @param {string} _shopId
   * @returns {Promise<MembershipRow|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getMembershipByCustomerAndShop(_client, _customerId, _shopId) {
    throw new Error("Not implemented");
  }

  /**
   * Shop UUIDs the customer has an active membership for (login reference).
   * @param {import("pg").PoolClient} _client
   * @param {string} _customerId
   * @returns {Promise<string[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listShopIdsForCustomer(_client, _customerId) {
    throw new Error("Not implemented");
  }

  /**
   * Active shops for the customer (id, name, slug) via `customer_shop_memberships` → `shops`.
   * @param {import("pg").PoolClient} _client
   * @param {string} _customerId
   * @returns {Promise<{ id: string, name: string, slug: string }[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listActiveShopsForCustomer(_client, _customerId) {
    throw new Error("Not implemented");
  }

  /**
   * Customer + optional nested address (API-shaped address keys).
   * @param {import("pg").PoolClient} _client
   * @param {string} _customerId
   * @returns {Promise<{
   *   id: string,
   *   user_id: string,
   *   display_name: string|null,
   *   is_blocked: boolean,
   *   is_deleted: boolean,
   *   address: null | {
   *     line1: string|null, line2: string|null, landmark: string|null,
   *     city: string|null, state: string|null, postalCode: string|null,
   *     country: string|null, lat: number|null, lng: number|null, raw: string|null
   *   }
   * }|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getCustomerProfileByCustomerId(_client, _customerId) {
    throw new Error("Not implemented");
  }

  /**
   * Partial profile update inside an open transaction (caller provides `withTx`).
   * @param {import("pg").PoolClient} _client
   * @param {{
   *   customerId: string,
   *   userId: string,
   *   displayName?: string|null,
   *   addressPatch?: Record<string, unknown>
   * }} _patch
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async patchCustomerProfile(_client, _patch) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {{ email: string, password_hash: string|null }} _row
   * @returns {Promise<{ id: string, email: string|null, registration_source: 'password'|'google' }>}
   */
  // eslint-disable-next-line no-unused-vars
  async insertUser(_client, _row) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {{ user_id: string, display_name: string|null }} _row
   * @returns {Promise<{ id: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async insertCustomer(_client, _row) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {{ shop_id: string, customer_id: string }} _row
   * @returns {Promise<{ id: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async insertMembership(_client, _row) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _membershipId
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async reactivateMembership(_client, _membershipId) {
    throw new Error("Not implemented");
  }
}

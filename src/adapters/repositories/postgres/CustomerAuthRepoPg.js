import { CustomerAuthRepo } from "../../../application/ports/repositories/CustomerAuthRepo.js";

export class CustomerAuthRepoPg extends CustomerAuthRepo {
  /** @param {import("pg").PoolClient} client */
  async getShopBySlug(client, slug) {
    const { rows } = await client.query(
      `SELECT id, slug, name, is_active, status, is_blocked, is_deleted
         FROM shops
        WHERE slug = $1`,
      [slug]
    );
    return rows[0] ?? null;
  }

  /** @param {import("pg").PoolClient} client */
  async getShopById(client, shopId) {
    const { rows } = await client.query(
      `SELECT id, slug, name, is_active, status, is_blocked, is_deleted
         FROM shops
        WHERE id = $1`,
      [shopId]
    );
    return rows[0] ?? null;
  }

  /** @param {import("pg").PoolClient} client */
  async getUserByEmail(client, email) {
    const { rows } = await client.query(
      `SELECT id, email, phone, password_hash, is_active
         FROM users
        WHERE lower(email) = lower($1)`,
      [email]
    );
    return rows[0] ?? null;
  }

  /** @param {import("pg").PoolClient} client */
  async getCustomerByUserId(client, userId) {
    const { rows } = await client.query(
      `SELECT id, user_id, display_name, is_blocked, is_deleted
         FROM customers
        WHERE user_id = $1`,
      [userId]
    );
    return rows[0] ?? null;
  }

  /** @param {import("pg").PoolClient} client */
  async getMembershipByCustomerAndShop(client, customerId, shopId) {
    const { rows } = await client.query(
      `SELECT id, shop_id, customer_id, is_active, is_blocked, is_deleted
         FROM customer_shop_memberships
        WHERE customer_id = $1 AND shop_id = $2`,
      [customerId, shopId]
    );
    return rows[0] ?? null;
  }

  /** @param {import("pg").PoolClient} client */
  async insertUser(client, { email, password_hash }) {
    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, password_hash]
    );
    return rows[0];
  }

  /** @param {import("pg").PoolClient} client */
  async insertCustomer(client, { user_id, display_name }) {
    const { rows } = await client.query(
      `INSERT INTO customers (user_id, display_name)
       VALUES ($1, $2)
       RETURNING id`,
      [user_id, display_name]
    );
    return rows[0];
  }

  /** @param {import("pg").PoolClient} client */
  async insertMembership(client, { shop_id, customer_id }) {
    const { rows } = await client.query(
      `INSERT INTO customer_shop_memberships (shop_id, customer_id, is_active)
       VALUES ($1, $2, true)
       RETURNING id`,
      [shop_id, customer_id]
    );
    return rows[0];
  }

  /** @param {import("pg").PoolClient} client */
  async reactivateMembership(client, membershipId) {
    await client.query(
      `UPDATE customer_shop_memberships
          SET is_active = true,
              is_blocked = false,
              is_deleted = false,
              updated_at = now()
        WHERE id = $1`,
      [membershipId]
    );
  }
}

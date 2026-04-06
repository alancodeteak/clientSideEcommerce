-- Remove any `public` tables not defined in `001_deployment_postgresql.sql` (e.g. legacy Better Auth
-- `user` / `session` / `account` / `verification`, old `superadmins`, or stray migration tables).
-- Run manually after a backup: `psql "$DATABASE_URL" -f migrations/002_drop_extraneous_public_tables.sql`
-- Or: `npm run db:prune`
-- Safe on a DB that already matches 001 (loop drops nothing unexpected).

DO $$
DECLARE
  r RECORD;
  canonical text[] := ARRAY[
    'addresses',
    'users',
    'shops',
    'categories',
    'products',
    'inventory_items',
    'customers',
    'shop_staff',
    'customer_shop_memberships',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'outbox_messages',
    'media_assets',
    'entity_images',
    'product_images'
  ];
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> ALL (canonical)
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
END $$;

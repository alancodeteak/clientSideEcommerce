-- This migration enables fast partial text search on product names using trigram indexing.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm
ON products
USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_categories_name_trgm
ON categories
USING gin (name gin_trgm_ops);

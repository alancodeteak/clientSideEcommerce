-- This script verifies that trigram index is used for product search queries.

EXPLAIN ANALYZE
SELECT *
FROM products
WHERE name ILIKE '%milk%';

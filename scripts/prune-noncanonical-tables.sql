-- Optional legacy cleanup for tables that are not part of migrations/001_full_schema.sql.
-- Add guarded `DROP TABLE IF EXISTS …` (or similar) only after backup and review.
-- Default no-op so `npm run db:prune` succeeds without side effects.
SELECT 1 AS ok;

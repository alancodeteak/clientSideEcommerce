import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { env } from "../src/config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL_REJECT_UNAUTHORIZED
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false }
});

const migrationsDir = path.join(__dirname, "../migrations");
const schemaFile = "001_full_schema.sql";
const sqlPath = path.join(migrationsDir, schemaFile);

try {
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`Missing canonical schema: migrations/${schemaFile}`);
  }
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  // eslint-disable-next-line no-console
  console.log("Applied schema:", schemaFile);
} finally {
  await pool.end();
}

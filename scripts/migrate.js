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
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((name) => /^\d+.*\.sql$/.test(name))
  .sort((a, b) => a.localeCompare(b, "en"));

try {
  for (const fileName of migrationFiles) {
    const sqlPath = path.join(migrationsDir, fileName);
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);
    // eslint-disable-next-line no-console
    console.log("Applied migration:", fileName);
  }
} finally {
  await pool.end();
}

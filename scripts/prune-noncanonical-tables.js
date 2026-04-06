import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console.error
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "development" ? { rejectUnauthorized: false } : { rejectUnauthorized: false }
});

const sqlPath = path.join(__dirname, "../migrations/002_drop_extraneous_public_tables.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

try {
  await pool.query(sql);
  // eslint-disable-next-line no-console.log
  console.log("Applied:", path.basename(sqlPath));
} finally {
  await pool.end();
}

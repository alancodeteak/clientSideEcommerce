import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { pool } from "../infra/db/pool.js";
import { createServer } from "./server.js";

async function main() {
  await pool.query("select 1 as ok");

  const app = createServer();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API listening");
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

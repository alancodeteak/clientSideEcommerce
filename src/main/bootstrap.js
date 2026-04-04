import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { pool } from "../infra/db/pool.js";
import { createServer } from "./server.js";

async function main() {
  await pool.query("select 1 as ok");

  const app = createServer();
  await new Promise((resolve, reject) => {
    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, "Server is running and healthy");
      resolve();
    });
    server.on("error", reject);
  });
}

main().catch((err) => {
  if (err?.code === "EADDRINUSE") {
    logger.error(
      { port: env.PORT },
      "Port already in use — stop the other process (e.g. lsof -i :PORT) or change PORT in .env"
    );
  } else if (err?.code === "ECONNREFUSED" || err?.cause?.code === "ECONNREFUSED") {
    logger.error("Cannot reach PostgreSQL — ensure the server is running and DATABASE_URL in .env is correct");
  }
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

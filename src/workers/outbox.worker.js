/*
This worker continuously processes pending outbox messages in background.
*/

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { pool } from "../infra/db/pool.js";
import { createOutboxHandlers } from "../application/services/outboxHandlers.js";
import { processOutboxBatch } from "../application/services/outboxProcessor.js";

function delay(ms, signal) {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    }
  });
}

async function runOutboxWorker() {
  const handlers = createOutboxHandlers();
  const pollIntervalMs = env.OUTBOX_POLL_INTERVAL_MS;
  const batchSize = env.OUTBOX_BATCH_SIZE;
  const maxRetries = env.OUTBOX_MAX_RETRIES;
  const shutdownController = new AbortController();
  let stopping = false;

  const stop = (signal) => {
    if (stopping) return;
    stopping = true;
    logger.info({ event: "outbox.worker.stopping", signal }, "Outbox worker shutdown requested");
    shutdownController.abort();
  };

  process.once("SIGINT", () => stop("SIGINT"));
  process.once("SIGTERM", () => stop("SIGTERM"));

  logger.info(
    {
      event: "outbox.worker.started",
      batchSize,
      pollIntervalMs,
      maxRetries
    },
    "Outbox worker started"
  );

  while (!stopping) {
    try {
      const result = await processOutboxBatch({
        pool,
        handlers,
        logger,
        batchSize,
        maxRetries
      });

      if (result.claimed > 0) {
        logger.info(
          {
            event: "outbox.worker.batch_processed",
            claimed: result.claimed,
            done: result.done,
            retried: result.retried,
            failed: result.failed
          },
          "Outbox batch processed"
        );
      }
    } catch (err) {
      logger.error({ event: "outbox.worker.batch_error", err }, "Outbox worker batch failed");
    }

    await delay(pollIntervalMs, shutdownController.signal);
  }

  await pool.end();
  logger.info({ event: "outbox.worker.stopped" }, "Outbox worker stopped");
}

runOutboxWorker().catch((err) => {
  logger.error({ event: "outbox.worker.fatal", err }, "Outbox worker fatal error");
  process.exit(1);
});

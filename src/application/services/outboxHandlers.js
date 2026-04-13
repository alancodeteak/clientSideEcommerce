/*
This file provides event handlers for outbox message processing.
*/

import { OUTBOX_EVENT_TYPES } from "../constants/outboxEventTypes.js";

async function simulateAsyncWork() {
  await Promise.resolve();
}

async function handleOrderCreated(payload, { logger, eventId }) {
  logger.info({ event: "outbox.handler.order_created", eventId, payload }, "Handling ORDER_CREATED event");
  await simulateAsyncWork();
}

async function handleOrderCompleted(payload, { logger, eventId }) {
  logger.info({ event: "outbox.handler.order_completed", eventId, payload }, "Handling ORDER_COMPLETED event");
  await simulateAsyncWork();
}

async function handleOrderCancelled(payload, { logger, eventId }) {
  logger.info({ event: "outbox.handler.order_cancelled", eventId, payload }, "Handling ORDER_CANCELLED event");
  await simulateAsyncWork();
}

export function createOutboxHandlers() {
  return Object.freeze({
    [OUTBOX_EVENT_TYPES.ORDER_CREATED]: handleOrderCreated,
    [OUTBOX_EVENT_TYPES.ORDER_COMPLETED]: handleOrderCompleted,
    [OUTBOX_EVENT_TYPES.ORDER_CANCELLED]: handleOrderCancelled
  });
}

import { logger } from "../../config/logger.js";

const ORDER_PLACED_EVENT = "order.placed";

function normalizeRoom(value) {
  if (value == null) return null;
  const room = String(value).trim();
  return room.length ? room : null;
}

function buildOrderPlacedEvent(payload) {
  return {
    type: ORDER_PLACED_EVENT,
    orderId: payload.orderId,
    shopId: payload.shopId,
    customerId: payload.customerId,
    orderNumber: payload.orderNumber,
    totalMinor: payload.totalMinor,
    emittedAt: new Date().toISOString()
  };
}

export function emitOrderPlacedToRooms(io, payload) {
  if (!io || typeof io.to !== "function" || !payload) return;

  const eventPayload = buildOrderPlacedEvent(payload);
  const rooms = [
    normalizeRoom(`shop:${payload.shopId}:staff`),
    normalizeRoom(`shop:${payload.shopId}:pickers`),
    normalizeRoom(`customer:${payload.customerId}`)
  ].filter(Boolean);

  for (const room of new Set(rooms)) {
    io.to(room).emit(ORDER_PLACED_EVENT, eventPayload);
  }
}

export function attachSocketServer(server, { corsOrigin } = {}) {
  let io = null;

  async function lazyAttach() {
    if (io) return io;
    try {
      const { Server } = await import("socket.io");
      io = new Server(server, {
        cors: {
          origin: corsOrigin || "*",
          credentials: true
        }
      });

      io.on("connection", (socket) => {
        socket.on("join.room", (roomName) => {
          const room = normalizeRoom(roomName);
          if (room) socket.join(room);
        });
      });

      logger.info("Realtime websocket server attached");
      return io;
    } catch (err) {
      logger.warn(
        {
          err: err?.message
        },
        "socket.io not available; realtime fanout is disabled"
      );
      return null;
    }
  }

  // Attempt to attach in the background without blocking startup.
  void lazyAttach();

  return {
    emitOrderPlaced(payload) {
      if (!io) return;
      emitOrderPlacedToRooms(io, payload);
    }
  };
}

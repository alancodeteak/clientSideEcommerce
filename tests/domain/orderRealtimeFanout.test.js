import { describe, it, expect, vi } from "vitest";
import { emitOrderPlacedToRooms } from "../../src/infra/realtime/socketServer.js";

describe("order realtime fanout", () => {
  it("emits order.placed to staff, pickers, and customer rooms", () => {
    const emit = vi.fn();
    const to = vi.fn(() => ({ emit }));
    const io = { to };

    emitOrderPlacedToRooms(io, {
      orderId: "o-1",
      shopId: "s-1",
      customerId: "c-1",
      orderNumber: "ORD-1",
      totalMinor: 120
    });

    expect(to).toHaveBeenCalledWith("shop:s-1:staff");
    expect(to).toHaveBeenCalledWith("shop:s-1:pickers");
    expect(to).toHaveBeenCalledWith("customer:c-1");
    expect(emit).toHaveBeenCalledTimes(3);
    expect(emit).toHaveBeenCalledWith(
      "order.placed",
      expect.objectContaining({
        type: "order.placed",
        orderId: "o-1",
        shopId: "s-1",
        customerId: "c-1",
        orderNumber: "ORD-1",
        totalMinor: 120
      })
    );
  });
});

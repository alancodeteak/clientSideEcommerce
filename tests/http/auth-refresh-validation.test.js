import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("removed refresh/logout routes", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns 404 for /api/auth/refresh", async () => {
    const res = await request(app).post("/api/auth/refresh").send({}).expect(404);
    expect(res.body.error?.code).toBe("ROUTE_NOT_FOUND");
  });

  it("returns 404 for /api/auth/logout", async () => {
    const res = await request(app).post("/api/auth/logout").send({}).expect(404);
    expect(res.body.error?.code).toBe("ROUTE_NOT_FOUND");
  });
});

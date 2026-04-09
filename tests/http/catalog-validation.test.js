import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("Removed /api/catalog routes", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns 404 for /api/catalog/items", async () => {
    const res = await request(app).get("/api/catalog/items").expect(404);
    expect(res.body.error?.code).toBe("ROUTE_NOT_FOUND");
  });

  it("returns 404 for /api/catalog/categories", async () => {
    const res = await request(app).get("/api/catalog/categories").expect(404);
    expect(res.body.error?.code).toBe("ROUTE_NOT_FOUND");
  });

  it("returns 404 for /api/catalog/products", async () => {
    const res = await request(app).get("/api/catalog/products").expect(404);
    expect(res.body.error?.code).toBe("ROUTE_NOT_FOUND");
  });
});

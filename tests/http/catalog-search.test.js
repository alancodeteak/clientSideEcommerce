import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("Removed /api/catalog/search route", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns 404 for /api/catalog/search", async () => {
    const res = await request(app).get("/api/catalog/search?type=products").expect(404);
    expect(res.body.error?.code).toBe("ROUTE_NOT_FOUND");
  });
});

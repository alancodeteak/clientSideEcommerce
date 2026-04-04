import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("Better Auth (Google OAuth handler)", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("GET /api/oauth/ok returns 200", async () => {
    const res = await request(app).get("/api/oauth/ok").expect(200);
    expect(res.body).toEqual({ ok: true });
  });
});

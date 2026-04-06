import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("POST /api/auth/oauth/jwt (security)", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns 403 when email-only exchange is disabled (default)", async () => {
    const res = await request(app)
      .post("/api/auth/oauth/jwt")
      .send({ email: "anyone@example.com" })
      .expect(403);

    expect(res.body.error?.code).toBe("FORBIDDEN");
  });
});

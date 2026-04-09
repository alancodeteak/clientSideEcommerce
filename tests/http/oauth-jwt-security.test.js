import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("POST /api/auth/oauth/jwt (security)", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns 401 when OAuth exchange cookie is missing", async () => {
    const res = await request(app).post("/api/auth/oauth/jwt").send({}).expect(401);
    expect(res.body.error?.code).toBe("UNAUTHORIZED");
  });
});

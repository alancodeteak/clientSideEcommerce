import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("GET /auth/google", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("redirects to dev google-start with no query string", async () => {
    const res = await request(app).get("/auth/google").expect(302);
    expect(res.headers.location).toBe("/api/oauth/dev/google-start");
  });

  it("forwards scalar query params to dev google-start", async () => {
    const res = await request(app)
      .get("/auth/google")
      .query({ shopId: "00000000-0000-4000-8000-000000000001", ref: "home" })
      .expect(302);
    expect(res.headers.location).toBe(
      "/api/oauth/dev/google-start?shopId=00000000-0000-4000-8000-000000000001&ref=home"
    );
  });

  it("forwards repeated query keys (array values) with both values in the Location URL", async () => {
    const res = await request(app).get("/auth/google?tag=a&tag=b").expect(302);
    const loc = res.headers.location;
    expect(loc.startsWith("/api/oauth/dev/google-start?")).toBe(true);
    expect(loc).toContain("tag=a");
    expect(loc).toContain("tag=b");
  });
});

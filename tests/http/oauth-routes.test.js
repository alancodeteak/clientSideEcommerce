import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/testApp.js";

describe("GET /api/oauth/ok", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns ok: true", async () => {
    const res = await request(app).get("/api/oauth/ok").expect(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("POST /api/oauth/sign-in/social", () => {
  let app;

  beforeAll(() => {
    app = getTestApp();
  });

  it("returns 503 when Google is not configured, otherwise JSON with Google authorize URL", async () => {
    const res = await request(app).post("/api/oauth/sign-in/social").send({
      provider: "google",
      disableRedirect: true,
      callbackURL: "http://localhost:4100/oauth/success"
    });

    if (res.status === 503) {
      expect(res.body.error?.code).toBe("SERVICE_UNAVAILABLE");
    } else {
      expect(res.status).toBe(200);
      expect(typeof res.body.url).toBe("string");
      expect(res.body.url).toMatch(/^https:\/\/accounts\.google\.com\//);
    }
  });
});

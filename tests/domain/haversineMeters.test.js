import { describe, it, expect } from "vitest";
import { haversineMeters } from "../../src/domain/geo/haversineMeters.js";

describe("haversineMeters", () => {
  it("returns ~0 for identical points", () => {
    expect(haversineMeters(12.97, 77.59, 12.97, 77.59)).toBeLessThan(1);
  });

  it("is symmetric", () => {
    const a = haversineMeters(0, 0, 1, 1);
    const b = haversineMeters(1, 1, 0, 0);
    expect(Math.abs(a - b)).toBeLessThan(0.5);
  });
});

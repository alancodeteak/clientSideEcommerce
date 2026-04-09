import { describe, it, expect } from "vitest";
import { toSearchParamsString } from "../../src/interface/http/routes/utils/queryString.js";

describe("toSearchParamsString", () => {
  it("returns empty string for empty input", () => {
    expect(toSearchParamsString({})).toBe("");
    expect(toSearchParamsString(undefined)).toBe("");
  });

  it("encodes scalar values", () => {
    expect(toSearchParamsString({ a: "1", b: "x y" })).toBe("a=1&b=x+y");
  });

  it("appends each array entry for the same key", () => {
    const s = toSearchParamsString({ tag: ["a", "b"] });
    expect(s).toContain("tag=a");
    expect(s).toContain("tag=b");
  });

  it("skips null and undefined values", () => {
    expect(toSearchParamsString({ a: "1", b: null, c: undefined })).toBe("a=1");
  });
});

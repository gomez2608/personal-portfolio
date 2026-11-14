import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to max hits and blocks the next", () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(limited("a", 0)).toBe(false);
    expect(limited("a", 1)).toBe(false);
    expect(limited("a", 2)).toBe(true);
  });

  it("tracks keys independently", () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limited("a", 0)).toBe(false);
    expect(limited("b", 0)).toBe(false);
    expect(limited("a", 1)).toBe(true);
  });

  it("forgets hits older than the window", () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limited("a", 0)).toBe(false);
    expect(limited("a", 10)).toBe(true);
    expect(limited("a", 2000)).toBe(false);
  });

  it("keeps separate limiters isolated", () => {
    const one = createRateLimiter({ windowMs: 1000, max: 1 });
    const two = createRateLimiter({ windowMs: 1000, max: 1 });
    one("a", 0);
    expect(two("a", 1)).toBe(false);
  });
});

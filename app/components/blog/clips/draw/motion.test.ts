import { describe, expect, it } from "vitest";
import { pointAlong } from "./motion";

describe("pointAlong", () => {
  const L: [number, number][] = [[0, 0], [100, 0], [100, 100]];
  it("interpolates by length across segments", () => {
    expect(pointAlong(L, 0)).toEqual([0, 0]);
    expect(pointAlong(L, 0.25)).toEqual([50, 0]);
    expect(pointAlong(L, 0.75)).toEqual([100, 50]);
    expect(pointAlong(L, 1)).toEqual([100, 100]);
  });
  it("clamps and handles degenerate input", () => {
    expect(pointAlong(L, 2)).toEqual([100, 100]);
    expect(pointAlong([[5, 5]], 0.5)).toEqual([5, 5]);
    expect(pointAlong([], 0.5)).toEqual([0, 0]);
  });
});

import { describe, expect, test } from "vitest";
import { activeCaption, activeCaptionIndex, connectorPoint, formatNumberEs, progress, sec } from "./timing";

describe("timing", () => {
  test("sec converts at 30fps", () => expect(sec(1.5)).toBe(45));
  test("progress clamps and eases", () => {
    expect(progress(0, 10, 20)).toBe(0);
    expect(progress(30, 10, 20)).toBe(1);
    expect(progress(15, 10, 20)).toBeCloseTo(0.5);
  });
  test("connectorPoint endpoints", () => {
    expect(connectorPoint([0, 0], [100, 0], 0, 0)).toEqual([0, 0]);
    expect(connectorPoint([0, 0], [100, 0], 0, 1)).toEqual([100, 0]);
  });
  test("curved connector bends toward -y at midpoint", () =>
    expect(connectorPoint([0, 100], [200, 100], 60, 0.5)[1]).toBeLessThan(100));
  test("activeCaption picks the caption covering the frame", () => {
    const caps = [
      { from: 0, to: 30, text: "a" },
      { from: 30, to: 60, text: "b" },
    ];
    expect(activeCaption(caps, 29)?.text).toBe("a");
    expect(activeCaption(caps, 30)?.text).toBe("b");
    expect(activeCaption(caps, 60)).toBeNull();
  });
  test("activeCaptionIndex returns the index, or -1 between and after captions", () => {
    const caps = [
      { from: 0, to: 30, text: "a" },
      { from: 40, to: 60, text: "b" },
    ];
    expect(activeCaptionIndex(caps, 0)).toBe(0);
    expect(activeCaptionIndex(caps, 35)).toBe(-1);
    expect(activeCaptionIndex(caps, 59)).toBe(1);
    expect(activeCaptionIndex(caps, 60)).toBe(-1);
  });
  test("Spanish number format", () => expect(formatNumberEs(1000000)).toBe("1.000.000"));
});

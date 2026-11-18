import { describe, expect, it } from "vitest";
import { C } from "../palette";
import { labelFill, labelSize, STROKE, toneColors, type LabelTone } from "./tokens";

describe("draw tokens", () => {
  it("never lets a label go below 34px", () => {
    expect(labelSize(20)).toBe(34);
    expect(labelSize(96)).toBe(96);
    expect(labelSize()).toBe(34);
  });

  it("maps tones to brand colours", () => {
    expect(toneColors("accent").fill).toBe(C.tangerine);
    expect(toneColors("ink")).toEqual({ fill: C.white, stroke: C.ink });
    expect(toneColors("none")).toEqual({ fill: "none", stroke: "none" });
  });

  it("never paints text tangerine", () => {
    const tones: LabelTone[] = ["ink", "navy", "slate", "white"];
    for (const t of tones) expect(labelFill(t)).not.toBe(C.tangerine);
  });

  it("has exactly two stroke weights", () => {
    expect(STROKE).toEqual({ thin: 2, bold: 3 });
  });
});

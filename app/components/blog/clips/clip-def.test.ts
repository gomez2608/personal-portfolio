import { afterEach, describe, expect, test, vi } from "vitest";
import { defineClip } from "./clip-def";
import { validateClipDef, type ClipDef } from "./clip-types";
import { sec } from "./timing";

// A valid 12 s clip with captions [0,180) and [180,360).
function def(overrides: Partial<ClipDef> = {}): ClipDef {
  return {
    id: "clip-1",
    title: "Clip de prueba",
    durationInFrames: sec(12),
    captions: [
      { from: 0, to: 180, text: "Primera idea" },
      { from: 180, to: 360, text: "Segunda idea" },
    ],
    Scene: () => null,
    ...overrides,
  };
}

describe("validateClipDef", () => {
  test("valid def has no errors", () => expect(validateClipDef(def())).toEqual([]));
  test("caption over 70 chars rejected", () =>
    expect(validateClipDef(def({ captions: [{ from: 0, to: 360, text: "x".repeat(71) }] }))).toHaveLength(1));
  test("caption of exactly 70 chars accepted", () =>
    expect(validateClipDef(def({ captions: [{ from: 0, to: 360, text: "x".repeat(70) }] }))).toEqual([]));
  test("overlapping captions rejected", () =>
    expect(
      validateClipDef(
        def({
          captions: [
            { from: 0, to: 200, text: "a" },
            { from: 180, to: 360, text: "b" },
          ],
        }),
      ).length,
    ).toBeGreaterThan(0));
  test("too long clip rejected", () =>
    expect(validateClipDef(def({ durationInFrames: sec(26) })).length).toBeGreaterThan(0));
  test("first caption must start at 0", () =>
    expect(validateClipDef(def({ captions: [{ from: 10, to: 360, text: "a" }] })).length).toBeGreaterThan(0));
});

describe("defineClip", () => {
  afterEach(() => vi.unstubAllEnvs());
  test("returns a component carrying its definition", () => {
    const d = def();
    expect(defineClip(d).def).toBe(d);
  });
  test("throws when the definition is invalid", () =>
    expect(() => defineClip(def({ id: "intro" }))).toThrow(/id "intro"/));
  test("throws in production too, so the build fails instead of shipping a broken clip", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => defineClip(def({ id: "intro" }))).toThrow(/id "intro"/);
  });
});

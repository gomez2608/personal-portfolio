import { describe, expect, test } from "vitest";
import { documentLang } from "./lang";

describe("documentLang", () => {
  test.each([
    ["/blog", "en", "es"],
    ["/blog/mezcla-de-expertos", "en", "es"],
    ["/mentoria/ana", "en", "es"],
    ["/privacidad", "en", "es"],
    ["/", "en", "en"],
    ["/", "es", "es"],
    ["/blogger", "en", "en"],
  ])("documentLang(%s, %s) = %s", (p, l, want) => {
    expect(documentLang(p, l as "en" | "es")).toBe(want);
  });
});

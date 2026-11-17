import { describe, expect, it } from "vitest";
import { resolveChromePath } from "./chrome-path";

describe("resolveChromePath", () => {
  it("returns CHROME_PATH when it is set", () => {
    expect(resolveChromePath({ CHROME_PATH: "/usr/bin/chromium" })).toBe("/usr/bin/chromium");
  });

  it("returns undefined when CHROME_PATH is unset", () => {
    expect(resolveChromePath({})).toBeUndefined();
  });

  it("returns undefined when CHROME_PATH is empty", () => {
    expect(resolveChromePath({ CHROME_PATH: "" })).toBeUndefined();
  });
});

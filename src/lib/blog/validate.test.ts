import { describe, expect, test } from "vitest";
import type { PostEntry } from "./entries";
import { validateClipModules, validatePosts } from "./validate";

const T = "2026-11-13";
const meta = {
  slug: "a",
  title: "Un titulo",
  hook: "Un gancho",
  date: "2026-11-01",
  issue: 1,
  status: "published",
  paper: {
    title: "Paper",
    url: "https://arxiv.org/abs/1234.5678",
    authors: ["Ada"],
    published: "2026-10-01",
  },
};

function entry(overrides: Partial<PostEntry> = {}): PostEntry {
  return {
    dir: "a",
    meta,
    mdx: "<MiOpinion>Texto</MiOpinion>",
    clipFiles: [],
    ...overrides,
  };
}

describe("validatePosts", () => {
  test("valid entry passes", () => expect(validatePosts([entry()], T)).toEqual([]));
  test("folder name must equal slug", () =>
    expect(validatePosts([entry({ dir: "b" })], T)).toContainEqual(expect.stringContaining("b")));
  test("invalid post.json is reported with the zod path", () =>
    expect(validatePosts([entry({ meta: { ...meta, title: "" } })], T)[0]).toMatch(/title/));
  test("missing page.mdx is reported", () =>
    expect(validatePosts([entry({ mdx: null })], T)).toHaveLength(1));
  test("published post with pending opinion fails", () =>
    expect(validatePosts([entry({ mdx: "<MiOpinion pending />" })], T)).toContainEqual(
      expect.stringMatching(/opini/i),
    ));
  test("draft post with pending opinion passes", () =>
    expect(
      validatePosts([entry({ mdx: "<MiOpinion pending />", meta: { ...meta, status: "draft" } })], T),
    ).toEqual([]));
  test("published post dated in the future fails", () =>
    expect(
      validatePosts([entry({ meta: { ...meta, date: "2026-12-01" } })], "2026-11-13"),
    ).toHaveLength(1));
  test.each([
    ["missing", "Solo texto."],
    ["empty", "<MiOpinion></MiOpinion>"],
    ["whitespace only", "<MiOpinion>\n  \n</MiOpinion>"],
  ])("published post with %s opinion fails", (_, mdx) =>
    expect(validatePosts([entry({ mdx })], T)).toContainEqual(expect.stringMatching(/MiOpinion/)));
  test("published post with a multi-line opinion passes", () =>
    expect(validatePosts([entry({ mdx: "<MiOpinion>\n\nCreo que sí.\n\n</MiOpinion>" })], T)).toEqual([]));
  test("draft post without an opinion passes", () =>
    expect(validatePosts([entry({ mdx: "Solo texto.", meta: { ...meta, status: "draft" } })], T)).toEqual([]));
  test("duplicate slugs are rejected", () =>
    expect(validatePosts([entry(), entry()], T).length).toBeGreaterThan(0));
});

describe("validateClipModules", () => {
  const goodDef = {
    id: "clip-1",
    title: "Un clip",
    durationInFrames: 360,
    captions: [{ from: 0, to: 360, text: "Hola" }],
    Scene: () => null,
  };
  const withClips = entry({ clipFiles: ["clip-1"] });

  test("valid clip passes", async () =>
    expect(await validateClipModules([withClips], async () => ({ default: { def: goodDef } }))).toEqual([]));
  test("invalid def is reported with its problems", async () => {
    const errors = await validateClipModules([withClips], async () => ({
      default: { def: { ...goodDef, captions: [{ from: 0, to: 360, text: "x".repeat(71) }] } },
    }));
    expect(errors).toEqual([expect.stringMatching(/app\/blog\/a\/clips\/clip-1\.tsx: .*1–70 characters/)]);
  });
  test("module without a defineClip default export fails", async () =>
    expect(await validateClipModules([withClips], async () => ({ default: () => null }))).toEqual([
      expect.stringMatching(/defineClip/),
    ]));
  test("a module that throws on load is reported with its message", async () =>
    expect(
      await validateClipModules([withClips], async () => {
        throw new Error("Invalid clip definition: boom");
      }),
    ).toEqual([expect.stringMatching(/clip-1\.tsx: .*boom/)]));
});

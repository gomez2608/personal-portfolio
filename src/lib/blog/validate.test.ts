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
  opinion: "Creo que sí.",
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
    mdx: "Texto",
    clipFiles: [],
    ...overrides,
  };
}

describe("validatePosts", () => {
  test("clip sources are checked", () => {
    const e = validatePosts([entry({ clipFiles: ["clip-1"], clipSources: { "clip-1": "<Box style={{}} />" } })], T);
    expect(e).toContainEqual(expect.stringContaining("app/blog/a/clips/clip-1.tsx"));
  });
  test("entries without clipSources skip the clip source check", () =>
    expect(validatePosts([entry({ clipFiles: ["clip-1"] })], T)).toEqual([]));
  test("valid entry passes", () => expect(validatePosts([entry()], T)).toEqual([]));
  test("folder name must equal slug", () =>
    expect(validatePosts([entry({ dir: "b" })], T)).toContainEqual(expect.stringContaining("b")));
  test("invalid post.json is reported with the zod path", () =>
    expect(validatePosts([entry({ meta: { ...meta, title: "" } })], T)[0]).toMatch(/title/));
  test("missing page.mdx is reported", () =>
    expect(validatePosts([entry({ mdx: null })], T)).toHaveLength(1));
  test.each([null, "", "  \n "])("published post with opinion %j fails", (opinion) =>
    expect(validatePosts([entry({ meta: { ...meta, opinion } })], T)).toContainEqual(
      "a: falta tu opinión. Escribe /opinion a en el PR.",
    ));
  test("published post with an opinion passes", () => expect(validatePosts([entry()], T)).toEqual([]));
  test("draft post with a null opinion passes", () =>
    expect(validatePosts([entry({ meta: { ...meta, status: "draft", opinion: null } })], T)).toEqual([]));
  test.each(["<MiOpinion pending />", "<MiOpinion>Hola</MiOpinion>"])("MDX containing %s is rejected", (mdx) =>
    expect(validatePosts([entry({ mdx })], T)).toContainEqual(
      "a: MiOpinion ya no se usa; la opinión va en post.json",
    ));
  const miOpinion = "a: page.mdx no puede tener un encabezado ni una etiqueta \"Mi opinión\"; la opinión solo viene de post.json";
  test.each([
    "Texto\n\n## Mi opinión\n\nCreo que sí.",
    "# mi OPINIÓN",
    "Texto\n\n**Mi opinión:** creo que sí.",
    "__Mi opinion__: creo que sí.",
  ])("published MDX with a Mi opinión heading or label is rejected: %j", (mdx) =>
    expect(validatePosts([entry({ mdx })], T)).toContainEqual(miOpinion));
  test("plain prose mentioning mi opinión is fine", () =>
    expect(validatePosts([entry({ mdx: "Texto. Esta es mi opinión sobre el tema, dicha en prosa." })], T)).toEqual([]));
  test("a draft post is not checked for Mi opinión", () =>
    expect(
      validatePosts([entry({ meta: { ...meta, status: "draft", opinion: null }, mdx: "## Mi opinión" })], T),
    ).toEqual([]));
  test("published post dated in the future fails", () =>
    expect(
      validatePosts([entry({ meta: { ...meta, date: "2026-12-01" } })], "2026-11-13"),
    ).toHaveLength(1));
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

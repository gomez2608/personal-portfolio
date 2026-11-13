import { describe, expect, test } from "vitest";
import type { PostEntry } from "./entries";
import { validatePosts } from "./validate";

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
  test("duplicate slugs are rejected", () =>
    expect(validatePosts([entry(), entry()], T).length).toBeGreaterThan(0));
});

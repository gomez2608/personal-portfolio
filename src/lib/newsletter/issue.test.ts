import { expect, test } from "vitest";
import type { PostMeta } from "@/lib/blog/schema";
import { validateIssue } from "./issue";

const meta = (slug: string, status: "draft" | "published"): PostMeta => ({
  slug,
  title: `Post ${slug}`,
  hook: "Gancho",
  date: "2026-11-13",
  issue: 1,
  status,
  paper: { title: "P", url: "https://arxiv.org/abs/1", authors: ["A"], published: "2020-01-01" },
});
const posts = new Map<string, PostMeta>([
  ["a", meta("a", "published")],
  ["brace", { ...meta("brace", "published"), title: "Un título con {{{FIRST_NAME}}}" }],
  ["close", { ...meta("close", "published"), title: "Cierra }}} aquí" }],
  ["b", meta("b", "published")],
  ["d", meta("d", "draft")],
]);
const issue = (over: Record<string, unknown> = {}) => ({
  issue: 1,
  date: "2026-12-01",
  subject: "Edición 1",
  preheader: "Un paper explicado simple",
  intro: "Hola.\n\nEsta edición trae un paper.",
  posts: [{ slug: "a", blurb: "x" }],
  ...over,
});
const errs = (i: unknown, file = "0001.json") => {
  const r = validateIssue(i, file, posts);
  return r.ok ? [] : r.errors;
};

test("valid issue passes", () => expect(validateIssue(issue({ posts: [{ slug: "a", blurb: "x" }] }), "0001.json", posts).ok).toBe(true));
test("file name must match number", () => expect(validateIssue(issue({ issue: 2 }), "0001.json", posts).ok).toBe(false));
test("unknown slug fails", () => expect(errs(issue({ posts: [{ slug: "zzz", blurb: "x" }] }))).toContainEqual(expect.stringContaining("zzz")));
test("draft post fails", () => expect(errs(issue({ posts: [{ slug: "d", blurb: "x" }] }))).toContainEqual(expect.stringContaining("d")));
test("more than 4 posts fails", () => expect(validateIssue(issue({ posts: Array(5).fill({ slug: "a", blurb: "x" }) }), "0001.json", posts).ok).toBe(false));

test("returns the parsed issue", () => {
  const r = validateIssue(issue(), "0001.json", posts);
  expect(r).toEqual({ ok: true, issue: issue() });
});
test("accepts a path and checks only its base name", () =>
  expect(validateIssue(issue(), "newsletter/issues/0001.json", posts).ok).toBe(true));
test("file name must be zero-padded to 4 digits", () => {
  expect(validateIssue(issue(), "1.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ issue: 12 }), "0012.json", posts).ok).toBe(true);
});
test("duplicate slug fails", () =>
  expect(errs(issue({ posts: [{ slug: "a", blurb: "x" }, { slug: "a", blurb: "y" }] }))).toContainEqual(
    expect.stringContaining("a"),
  ));
test("non-integer issue numbers fail", () => {
  expect(validateIssue(issue({ issue: 1.5 }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ issue: "1" }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ issue: 0 }), "0000.json", posts).ok).toBe(false);
});
test.each(["subject", "preheader", "intro"])("%s with Resend placeholder braces fails", (field) => {
  expect(validateIssue(issue({ [field]: "a {{{RESEND_UNSUBSCRIBE_URL}}} b" }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ [field]: "a }}} b" }), "0001.json", posts).ok).toBe(false);
});
test("blurb with Resend placeholder braces fails", () =>
  expect(validateIssue(issue({ posts: [{ slug: "a", blurb: "{{{FIRST_NAME}}}" }] }), "0001.json", posts).ok).toBe(false));
test("length limits", () => {
  expect(validateIssue(issue({ subject: "s".repeat(91) }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ subject: "" }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ preheader: "p".repeat(141) }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ intro: "i".repeat(801) }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ posts: [] }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ posts: [{ slug: "a", blurb: "b".repeat(321) }] }), "0001.json", posts).ok).toBe(false);
});
test("date must be a real YYYY-MM-DD day", () => {
  expect(validateIssue(issue({ date: "2026-02-30" }), "0001.json", posts).ok).toBe(false);
  expect(validateIssue(issue({ date: "1/12/2026" }), "0001.json", posts).ok).toBe(false);
});
test("unknown keys fail", () => expect(validateIssue(issue({ extra: 1 }), "0001.json", posts).ok).toBe(false));
test("non-object input fails with a message", () => expect(errs(null).length).toBeGreaterThan(0));
test.each(["brace", "close"])("a referenced post whose title has Resend braces fails (%s)", (slug) =>
  expect(errs(issue({ posts: [{ slug, blurb: "x" }] }))).toContainEqual(expect.stringContaining(slug)));

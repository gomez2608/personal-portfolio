import { expect, test } from "vitest";
import { PostMetaSchema } from "./schema";

const valid = { slug: "mezcla-de-expertos", title: "Mezcla de expertos", hook: "Por qué los modelos gigantes no usan todo su cerebro.",
  date: "2026-11-13", issue: 1, status: "draft", opinion: null,
  paper: { title: "Outrageously Large Neural Networks", url: "https://arxiv.org/abs/1701.06538", authors: ["Noam Shazeer"], published: "2017-01-23" } };
test("accepts a valid post", () => expect(PostMetaSchema.parse(valid)).toEqual(valid));
test.each(["Mezcla", "mezcla_de", "-mezcla", "og", "clip-preview"])("rejects slug %s", (slug) =>
  expect(PostMetaSchema.safeParse({ ...valid, slug }).success).toBe(false));
test("rejects title over 90 chars", () => expect(PostMetaSchema.safeParse({ ...valid, title: "x".repeat(91) }).success).toBe(false));
test("rejects bad date", () => expect(PostMetaSchema.safeParse({ ...valid, date: "13/11/2026" }).success).toBe(false));
test("rejects missing authors", () => expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, authors: [] } }).success).toBe(false));
test("rejects non-URL paper link", () => expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, url: "arxiv 1701.06538" } }).success).toBe(false));
test.each(["2026-13-45", "2026-02-30", "2026-00-10"])("rejects calendar-invalid date %s", (date) => {
  expect(PostMetaSchema.safeParse({ ...valid, date }).success).toBe(false);
  expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, published: date } }).success).toBe(false);
});
test("accepts a leap day", () => expect(PostMetaSchema.safeParse({ ...valid, date: "2028-02-29" }).success).toBe(true));
test("accepts a string opinion", () => expect(PostMetaSchema.safeParse({ ...valid, opinion: "Creo que sí." }).success).toBe(true));
test("requires the opinion key", () => {
  const rest: Record<string, unknown> = { ...valid };
  delete rest.opinion;
  expect(PostMetaSchema.safeParse(rest).success).toBe(false);
});
test("accepts 1500 chars and rejects 1501", () => {
  expect(PostMetaSchema.safeParse({ ...valid, opinion: "x".repeat(1500) }).success).toBe(true);
  expect(PostMetaSchema.safeParse({ ...valid, opinion: "x".repeat(1501) }).success).toBe(false);
});
test.each(["a {{{ b", "a }}} b"])("rejects opinion containing %s", (opinion) =>
  expect(PostMetaSchema.safeParse({ ...valid, opinion }).success).toBe(false));

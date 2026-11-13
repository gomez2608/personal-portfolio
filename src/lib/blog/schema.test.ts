import { expect, test } from "vitest";
import { PostMetaSchema } from "./schema";

const valid = { slug: "mezcla-de-expertos", title: "Mezcla de expertos", hook: "Por qué los modelos gigantes no usan todo su cerebro.",
  date: "2026-11-13", issue: 1, status: "draft",
  paper: { title: "Outrageously Large Neural Networks", url: "https://arxiv.org/abs/1701.06538", authors: ["Noam Shazeer"], published: "2017-01-23" } };
test("accepts a valid post", () => expect(PostMetaSchema.parse(valid)).toEqual(valid));
test.each(["Mezcla", "mezcla_de", "-mezcla", "og", "clip-preview"])("rejects slug %s", (slug) =>
  expect(PostMetaSchema.safeParse({ ...valid, slug }).success).toBe(false));
test("rejects title over 90 chars", () => expect(PostMetaSchema.safeParse({ ...valid, title: "x".repeat(91) }).success).toBe(false));
test("rejects bad date", () => expect(PostMetaSchema.safeParse({ ...valid, date: "13/11/2026" }).success).toBe(false));
test("rejects missing authors", () => expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, authors: [] } }).success).toBe(false));
test("rejects non-URL paper link", () => expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, url: "arxiv 1701.06538" } }).success).toBe(false));

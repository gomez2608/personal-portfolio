import { describe, expect, test } from "vitest";
import { applyOpinion, parseOpinionCommand } from "./opinion";

describe("parseOpinionCommand", () => {
  test("parses a valid command", () =>
    expect(parseOpinionCommand("/opinion mezcla-de-expertos\nCreo que esto importa.")).toEqual({
      slug: "mezcla-de-expertos",
      text: "Creo que esto importa.",
    }));
  test("allows extra spaces on the first line and trims trailing whitespace of the text", () =>
    expect(parseOpinionCommand("/opinion    mezcla-de-expertos   \nUno.\n\nDos.  \n\n")).toEqual({
      slug: "mezcla-de-expertos",
      text: "Uno.\n\nDos.",
    }));
  test("handles CRLF line endings", () =>
    expect(parseOpinionCommand("/opinion mezcla\r\nHola.\r\n")).toEqual({ slug: "mezcla", text: "Hola." }));
  test("keeps the text verbatim (no rewriting)", () =>
    expect(parseOpinionCommand("/opinion a\n  sangría *y* `código`")?.text).toBe("  sangría *y* `código`"));
  test("missing text gives an empty text", () =>
    expect(parseOpinionCommand("/opinion mezcla\n   \n")).toEqual({ slug: "mezcla", text: "" }));
  test("rejects an uppercase slug", () => expect(parseOpinionCommand("/opinion Mezcla\nHola.")).toBeNull());
  test("rejects a missing newline", () => expect(parseOpinionCommand("/opinion mezcla Hola.")).toBeNull());
  test("rejects a slug-only first line with no newline", () => expect(parseOpinionCommand("/opinion mezcla")).toBeNull());
  test("rejects a missing slug", () => expect(parseOpinionCommand("/opinion \nHola.")).toBeNull());
  test("rejects path-like slugs", () => expect(parseOpinionCommand("/opinion ../etc\nHola.")).toBeNull());
  test("rejects a slug over 80 chars", () => expect(parseOpinionCommand(`/opinion ${"a".repeat(81)}\nHola.`)).toBeNull());
  test("rejects text before the command", () => expect(parseOpinionCommand("hola /opinion mezcla\nHola.")).toBeNull());
});

const post = {
  slug: "mezcla",
  title: "Título",
  hook: "Gancho",
  date: "2026-11-13",
  issue: 1,
  status: "draft",
  paper: { title: "P", url: "https://arxiv.org/abs/1", authors: ["A"], published: "2017-01-23" },
  opinion: null,
};
const postJson = `${JSON.stringify(post, null, 2)}\n`;

describe("applyOpinion", () => {
  test("sets the opinion, keeps the other fields and key order, 2-space indent and trailing newline", () => {
    const r = applyOpinion(postJson, "Mi opinión.\n\nSegundo párrafo.");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.json).toBe(`${JSON.stringify({ ...post, opinion: "Mi opinión.\n\nSegundo párrafo." }, null, 2)}\n`);
    expect(Object.keys(JSON.parse(r.json))).toEqual(Object.keys(post));
  });
  test("replaces an existing opinion in place", () => {
    const withOpinion = JSON.stringify({ ...post, opinion: "Vieja." }, null, 2);
    const r = applyOpinion(withOpinion, "Nueva.");
    expect(r).toEqual({ ok: true, json: `${JSON.stringify({ ...post, opinion: "Nueva." }, null, 2)}\n` });
  });
  test("accepts exactly 1500 chars", () => expect(applyOpinion(postJson, "x".repeat(1500)).ok).toBe(true));
  test.each([
    ["empty", ""],
    ["whitespace only", "  \n "],
    ["over 1500 chars", "x".repeat(1501)],
    ["{{{", "a {{{ b"],
    ["}}}", "a }}} b"],
  ])("errors for %s", (_name, text) => {
    const r = applyOpinion(postJson, text);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/opini[oó]n/i);
  });
  test("error messages are specific", () => {
    const err = (t: string) => {
      const r = applyOpinion(postJson, t);
      return r.ok ? "" : r.error;
    };
    expect(err("")).toMatch(/vac[ií]a/);
    expect(err("x".repeat(1501))).toMatch(/1500/);
    expect(err("{{{")).toMatch(/\{\{\{/);
  });
  test.each(["{not json", "[1,2]", "null", '"texto"'])("errors for invalid post JSON %s", (raw) => {
    const r = applyOpinion(raw, "Hola.");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/JSON/);
  });
});

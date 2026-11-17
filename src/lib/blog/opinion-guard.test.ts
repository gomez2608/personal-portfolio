import { expect, test } from "vitest";
import { applyOpinion, parseOpinionCommand } from "./opinion";
import { findUnauthorizedOpinions } from "./opinion-guard";

type C = { user: string; viaApp: boolean; body: string; createdAt: string };
const owner = (body: string, createdAt = "2026-11-17T10:00:00Z"): C => ({ user: "gomez2608", viaApp: false, body, createdAt });
const err = (slug: string) => `${slug}: la opinión no coincide con un comentario /opinion tuyo`;

test("a matching owner comment is ok", () =>
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Hola." }], [owner("/opinion mezcla\nHola.\n")])).toEqual([]));

test("a mismatch is flagged", () =>
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Hola, editado." }], [owner("/opinion mezcla\nHola.")])).toEqual([
    err("mezcla"),
  ]));

test("a comment from another user doesn't count", () =>
  expect(
    findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Hola." }], [{ ...owner("/opinion mezcla\nHola."), user: "otro" }]),
  ).toEqual([err("mezcla")]));

test("a comment made via a GitHub App doesn't count", () =>
  expect(
    findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Hola." }], [{ ...owner("/opinion mezcla\nHola."), viaApp: true }]),
  ).toEqual([err("mezcla")]));

test("the latest owner comment overrides an earlier one", () => {
  const comments = [owner("/opinion mezcla\nNueva.", "2026-11-17T12:00:00Z"), owner("/opinion mezcla\nVieja.", "2026-11-17T10:00:00Z")];
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Nueva." }], comments)).toEqual([]);
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Vieja." }], comments)).toEqual([err("mezcla")]);
});

test("a later app or foreign comment doesn't override the owner's", () =>
  expect(
    findUnauthorizedOpinions(
      [{ slug: "mezcla", opinion: "Del dueño." }],
      [
        owner("/opinion mezcla\nDel dueño.", "2026-11-17T10:00:00Z"),
        { ...owner("/opinion mezcla\nDe la IA.", "2026-11-17T11:00:00Z"), viaApp: true },
        { ...owner("/opinion mezcla\nDe otro.", "2026-11-17T12:00:00Z"), user: "otro" },
      ],
    ),
  ).toEqual([]));

test("a slug with no comment is flagged; comments for other slugs don't count", () =>
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Hola." }], [owner("/opinion otra\nHola.")])).toEqual([
    err("mezcla"),
  ]));

test("a null opinion is fine without any comment", () =>
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: null }], [])).toEqual([]));

test("only flagged posts are reported, in input order", () =>
  expect(
    findUnauthorizedOpinions(
      [
        { slug: "b", opinion: "x" },
        { slug: "a", opinion: "ok" },
        { slug: "c", opinion: "y" },
      ],
      [owner("/opinion a\nok")],
    ),
  ).toEqual([err("b"), err("c")]));

test("round trip: what applyOpinion writes equals what parseOpinionCommand returns", () => {
  const body = "/opinion mezcla  \r\n  Sangría, *énfasis*, `código`,\n\n\"comillas\" y \\barras\\ y emoji 🙂.\t \n\n";
  const cmd = parseOpinionCommand(body);
  expect(cmd).not.toBeNull();
  const post = `${JSON.stringify({ slug: "mezcla", opinion: null }, null, 2)}\n`;
  const r = applyOpinion(post, cmd!.text);
  expect(r.ok).toBe(true);
  if (!r.ok) return;
  const written = (JSON.parse(r.json) as { opinion: string }).opinion;
  expect(written).toBe(cmd!.text);
  expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: written }], [owner(body)])).toEqual([]);
});

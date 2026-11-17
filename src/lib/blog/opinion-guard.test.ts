import { describe, expect, test } from "vitest";
import { applyOpinion, parseOpinionCommand } from "./opinion";
import { findIncompleteFileList, findProtectedPathChanges, findUnauthorizedOpinions, type OpinionComment } from "./opinion-guard";

type C = OpinionComment;
const owner = (body: string, createdAt = "2026-11-17T10:00:00Z"): C => ({
  user: "gomez2608",
  viaApp: false,
  body,
  createdAt,
  updatedAt: createdAt,
});
const err = (slug: string) => `${slug}: la opinión no coincide con un comentario /opinion tuyo`;
const edited = (slug: string) => `${slug}: tu comentario /opinion fue editado; publica un /opinion nuevo en vez de editar`;

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

describe("edited /opinion comments", () => {
  test("an edited comment is rejected, even when its current text matches", () =>
    expect(
      findUnauthorizedOpinions(
        [{ slug: "mezcla", opinion: "Hola." }],
        [{ ...owner("/opinion mezcla\nHola.", "2026-11-17T10:00:00Z"), updatedAt: "2026-11-17T10:05:00Z" }],
      ),
    ).toEqual([edited("mezcla")]));

  test("an unedited comment is accepted", () =>
    expect(
      findUnauthorizedOpinions(
        [{ slug: "mezcla", opinion: "Hola." }],
        [{ ...owner("/opinion mezcla\nHola.", "2026-11-17T10:00:00Z"), updatedAt: "2026-11-17T10:00:00Z" }],
      ),
    ).toEqual([]));

  test("a later unedited comment after an edited one is the one that counts", () => {
    const comments = [
      { ...owner("/opinion mezcla\nEditada.", "2026-11-17T10:00:00Z"), updatedAt: "2026-11-17T11:30:00Z" },
      owner("/opinion mezcla\nNueva.", "2026-11-17T11:00:00Z"),
    ];
    expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Nueva." }], comments)).toEqual([]);
    expect(findUnauthorizedOpinions([{ slug: "mezcla", opinion: "Editada." }], comments)).toEqual([err("mezcla")]);
  });

  test("an edited comment after an unedited one still blocks", () =>
    expect(
      findUnauthorizedOpinions(
        [{ slug: "mezcla", opinion: "Vieja." }],
        [
          owner("/opinion mezcla\nVieja.", "2026-11-17T10:00:00Z"),
          { ...owner("/opinion mezcla\nNueva.", "2026-11-17T11:00:00Z"), updatedAt: "2026-11-17T11:05:00Z" },
        ],
      ),
    ).toEqual([edited("mezcla")]));

  test("an edited comment from someone else is simply ignored", () =>
    expect(
      findUnauthorizedOpinions(
        [{ slug: "mezcla", opinion: "Hola." }],
        [
          owner("/opinion mezcla\nHola.", "2026-11-17T10:00:00Z"),
          { ...owner("/opinion mezcla\nOtra.", "2026-11-17T11:00:00Z"), user: "otro", updatedAt: "2026-11-17T11:05:00Z" },
        ],
      ),
    ).toEqual([]));
});

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

describe("findProtectedPathChanges", () => {
  test("a PR touching only posts is ok", () =>
    expect(findProtectedPathChanges(["app/blog/mezcla/post.json", "app/blog/mezcla/page.mdx", "README.md"])).toEqual([]));
  test.each([
    ".github/workflows/opinion-guard.yml",
    ".github/workflows/nuevo.yml",
    "scripts/blog/opinion-guard.ts",
    "scripts/blog/check.ts",
    "src/lib/blog/opinion.ts",
    "src/lib/blog/opinion-guard.ts",
    "src/lib/blog/opinion-guard.test.ts",
  ])("flags %s", (path) =>
    expect(findProtectedPathChanges(["app/blog/x/post.json", path])).toEqual([
      `El PR modifica archivos protegidos (${path}); revísalo tú y aplica esos cambios fuera de una edición.`,
    ]));
  test.each(["github/workflows/x.yml", "scripts/newsletter/send.ts", "src/lib/blog/schema.ts", "app/.github/x"])(
    "doesn't flag %s",
    (path) => expect(findProtectedPathChanges([path])).toEqual([]),
  );
  test("lists up to 5 paths, deduplicated, and counts the rest", () => {
    const paths = [".github/a", ".github/b", ".github/a", "scripts/blog/c", "scripts/blog/d", "scripts/blog/e", "scripts/blog/f", "scripts/blog/g"];
    expect(findProtectedPathChanges(paths)).toEqual([
      "El PR modifica archivos protegidos (.github/a, .github/b, scripts/blog/c, scripts/blog/d, scripts/blog/e y 2 más); revísalo tú y aplica esos cambios fuera de una edición.",
    ]);
  });
});

describe("findIncompleteFileList", () => {
  test("ok when the API listed every changed file", () => expect(findIncompleteFileList(12, 12)).toEqual([]));
  test("fails closed when the PR changes more files than were listed", () =>
    expect(findIncompleteFileList(3500, 3000)).toEqual([
      "El PR cambia 3500 archivos pero la API solo listó 3000; no puedo verificarlo completo. Revísalo tú y divide el PR.",
    ]));
});

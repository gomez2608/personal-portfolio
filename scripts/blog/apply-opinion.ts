/**
 * Run by .github/workflows/opinion.yml from the trusted default-branch checkout, never from the PR.
 *
 * Env:
 *   COMMENT_BODY        the PR comment, untrusted text (read only from here, never from argv/shell)
 *   POST_ROOT           checkout of the PR head branch (default ".")
 *   CHANGED_FILES_PATH  file listing the PR's changed paths, one per line
 *   GITHUB_OUTPUT       set by Actions; receives status=ok|unchanged|error, slug, error
 *
 * Exits 0 for every refusal it can explain (status=error), so the workflow can reply and stop.
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { applyOpinion, parseOpinionCommand } from "../../src/lib/blog/opinion";

type Result = { status: "ok" | "unchanged"; slug: string } | { status: "error"; slug?: string; error: string };

function run(): Result {
  const cmd = parseOpinionCommand(process.env.COMMENT_BODY ?? "");
  if (!cmd) {
    return {
      status: "error",
      error: "Formato no válido. La primera línea debe ser `/opinion <slug>` (minúsculas, números y guiones) y el texto va en las líneas siguientes.",
    };
  }
  const { slug, text } = cmd;

  const changedPath = process.env.CHANGED_FILES_PATH;
  if (!changedPath) throw new Error("CHANGED_FILES_PATH is not set");
  const changed = fs.readFileSync(changedPath, "utf8").split("\n").filter(Boolean);
  if (!changed.some((f) => f.startsWith(`app/blog/${slug}/`))) {
    return { status: "error", slug, error: `Este PR no cambia \`app/blog/${slug}/\`; solo puedo escribir la opinión de un post de este PR.` };
  }

  const root = path.resolve(process.env.POST_ROOT ?? ".");
  const file = path.join(root, "app", "blog", slug, "post.json");
  // Refuse symlinks anywhere on the path, so the write can't land outside the post folder.
  let stat: fs.Stats | null = null;
  try {
    stat = fs.lstatSync(file);
  } catch {
    stat = null;
  }
  if (!stat || !stat.isFile() || fs.realpathSync(file) !== path.join(fs.realpathSync(root), "app", "blog", slug, "post.json")) {
    return { status: "error", slug, error: `No encontré \`app/blog/${slug}/post.json\` en la rama del PR.` };
  }

  const current = fs.readFileSync(file, "utf8");
  const result = applyOpinion(current, text);
  if (!result.ok) return { status: "error", slug, error: result.error };
  if (result.json === current) return { status: "unchanged", slug };
  fs.writeFileSync(file, result.json);
  return { status: "ok", slug };
}

function writeOutputs(r: Result) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) return;
  const delim = `EOF_${randomBytes(16).toString("hex")}`;
  const lines = [`status=${r.status}`, `slug=${r.slug ?? ""}`];
  if (r.status === "error") lines.push(`error<<${delim}`, r.error, delim);
  fs.appendFileSync(out, `${lines.join("\n")}\n`);
}

const r = run();
writeOutputs(r);
if (r.status === "error") console.error(`opinion: ${r.error}`);
else console.log(`opinion: ${r.status} (${r.slug})`);

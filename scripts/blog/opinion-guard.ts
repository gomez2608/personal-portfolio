/**
 * Run by .github/workflows/opinion-guard.yml from the trusted default-branch checkout.
 * Reads the PR only through the GitHub API (as data): changed post.json files at the head SHA and
 * all PR comments, then fails unless every non-null opinion equals the latest `/opinion <slug>`
 * comment written by gomez2608 directly (not via a GitHub App), and that the PR touches no protected
 * path (.github/, scripts/blog/, src/lib/blog/opinion*).
 *
 * Env: PR (number), GH_REPO (owner/name), GH_TOKEN, HEAD_SHA (optional; defaults to the PR's head).
 */
import { execFileSync } from "node:child_process";
import {
  findProtectedPathChanges,
  findUnauthorizedOpinions,
  type OpinionComment,
} from "../../src/lib/blog/opinion-guard";

const POST_RE = /^app\/blog\/([^/]+)\/post\.json$/;

const pr = process.env.PR ?? "";
const repo = process.env.GH_REPO ?? "";
if (!/^[1-9]\d*$/.test(pr)) throw new Error(`PR must be a number, got "${pr}"`);
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`GH_REPO must be owner/name, got "${repo}"`);

function gh(...args: string[]): string {
  return execFileSync("gh", ["api", ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}
/** All pages of a paginated list endpoint, flattened. */
function list<T>(endpoint: string): T[] {
  return (JSON.parse(gh("--paginate", "--slurp", endpoint)) as T[][]).flat();
}

// The workflow passes the SHA it posts the commit status on, so the check and the status agree.
const headSha =
  process.env.HEAD_SHA || (JSON.parse(gh(`repos/${repo}/pulls/${pr}`)) as { head: { sha: string } }).head.sha;
if (!/^[0-9a-f]{40}$/.test(headSha)) throw new Error(`Bad head SHA "${headSha}"`);

const files = list<{ filename: string; status: string; previous_filename?: string }>(
  `repos/${repo}/pulls/${pr}/files?per_page=100`,
);
// Both sides of a rename count, so moving a workflow or guard file away is caught too.
const errors: string[] = findProtectedPathChanges(
  files.flatMap((f) => (f.previous_filename ? [f.filename, f.previous_filename] : [f.filename])),
);
const changed: { slug: string; opinion: string | null }[] = [];
for (const f of files) {
  const m = POST_RE.exec(f.filename);
  if (!m || f.status === "removed") continue;
  const slug = m[1];
  const encoded = f.filename.split("/").map(encodeURIComponent).join("/");
  const raw = gh("-H", "Accept: application/vnd.github.raw+json", `repos/${repo}/contents/${encoded}?ref=${headSha}`);
  let opinion: unknown;
  try {
    const parsed: unknown = JSON.parse(raw);
    opinion = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>).opinion : undefined;
  } catch {
    opinion = undefined;
  }
  if (opinion === null || typeof opinion === "string") changed.push({ slug, opinion });
  else errors.push(`${slug}: no pude leer la opinión de ${f.filename}`);
}

const comments: OpinionComment[] = list<{
  user: { login: string } | null;
  performed_via_github_app: unknown;
  body: string | null;
  created_at: string;
}>(`repos/${repo}/issues/${pr}/comments?per_page=100`).map((c) => ({
  user: c.user?.login ?? "",
  viaApp: c.performed_via_github_app != null,
  body: c.body ?? "",
  createdAt: c.created_at,
}));

errors.push(...findUnauthorizedOpinions(changed, comments));
if (errors.length > 0) {
  for (const e of errors) console.error(`::error::${e}`);
  process.exit(1);
}
console.log(`opinion-guard ok (PR #${pr} at ${headSha.slice(0, 7)}: ${changed.length} posts, ${comments.length} comments)`);

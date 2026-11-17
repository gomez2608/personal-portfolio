/**
 * Fails when any `opinion` in app/blog/<slug>/post.json changed in a commit that isn't the
 * `/opinion` workflow's (author github-actions[bot], message "opinion: …").
 *
 * Range: merge-base(origin/master, HEAD)..HEAD, so a pull_request run and a workflow_dispatch run
 * on the PR branch see the same commits. Needs full history (fetch-depth: 0).
 */
import { execFileSync } from "node:child_process";
import { findIllegalOpinionEdits, type OpinionCommit } from "../../src/lib/blog/opinion-guard";

const POST_RE = /^app\/blog\/([^/]+)\/post\.json$/;
/** Stands in for a post.json that isn't valid JSON (or has a non-string opinion), so it can't hide a change. */
const UNREADABLE = "\u0000unreadable post.json";

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function opinionsAt(sha: string): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  const files = git("ls-tree", "-r", "--name-only", sha, "--", "app/blog").split("\n");
  for (const f of files) {
    const m = POST_RE.exec(f);
    if (!m) continue;
    let value: string | null = UNREADABLE;
    try {
      const parsed: unknown = JSON.parse(git("show", `${sha}:${f}`));
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const op = (parsed as Record<string, unknown>).opinion;
        if (op === undefined || op === null) value = null;
        else if (typeof op === "string") value = op;
      }
    } catch {
      // stays UNREADABLE
    }
    out[m[1]] = value;
  }
  return out;
}

const baseRef = process.env.OPINION_GUARD_BASE_REF ?? "origin/master";
const base = git("merge-base", baseRef, "HEAD").trim();
const log = git("log", "--reverse", "--topo-order", "--format=%H%x1f%an%x1f%s", `${base}..HEAD`);
const commits: OpinionCommit[] = log
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [sha, author, message] = line.split("\x1f");
    return { sha, author, message, opinions: opinionsAt(sha) };
  });

const errors = findIllegalOpinionEdits(commits, opinionsAt(base));
if (errors.length > 0) {
  for (const e of errors) console.error(`::error::${e}`);
  console.error("Only the /opinion workflow (github-actions[bot], \"opinion: <slug>\") may change an opinion.");
  process.exit(1);
}
console.log(`opinion-guard ok (${commits.length} commits since ${base.slice(0, 7)})`);

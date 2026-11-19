/**
 * npm run newsletter:send -- --issue N [--dry-run] [--test-to you@x.co] [--wait-min 15]
 *
 * --dry-run   validate, write .newsletter-preview/NNNN.html and print a summary. No network.
 * --test-to   send one normal email (subject "[Prueba] …") to that address. No claim, no live check.
 * (default)   wait until every post is live, claim the issue in Neon, broadcast to the segment.
 *
 * db.ts and resend.ts `import "server-only"`, which throws under plain Node. They are loaded
 * with dynamic import() only on the network paths, and the npm script runs tsx with
 * `--conditions=react-server` so "server-only" resolves to its empty build there.
 */
import fs from "node:fs";
import path from "node:path";
import { site } from "../../app/data/site";
import { ogImagePath, readPostEntries } from "../../src/lib/blog/entries";
import { PostMetaSchema, type PostMeta } from "../../src/lib/blog/schema";
import { renderIssueEmail, type IssuePost } from "../../src/lib/newsletter/emails";
import { issueFileName, validateIssue, type Issue } from "../../src/lib/newsletter/issue";
import { sendIssue } from "../../src/lib/newsletter/send";

const ISSUES_DIR = "newsletter/issues";
const PREVIEW_DIR = ".newsletter-preview";
const POLL_MS = 30_000;

type Args = { issue: number; dryRun: boolean; testTo: string | null; waitMin: number };

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function parseArgs(argv: string[]): Args {
  let issue: number | null = null;
  let dryRun = false;
  let testTo: string | null = null;
  let waitMin = 15;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) fail(`${a} needs a value`);
      return v;
    };
    if (a === "--issue") {
      const v = value();
      if (!/^[1-9]\d*$/.test(v)) fail(`--issue must be a positive integer, got "${v}"`);
      issue = Number(v);
    } else if (a === "--dry-run") dryRun = true;
    else if (a === "--test-to") {
      testTo = value();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo)) fail(`--test-to is not an email address: "${testTo}"`);
    } else if (a === "--wait-min") {
      const v = value();
      if (!/^\d+(\.\d+)?$/.test(v)) fail(`--wait-min must be a number of minutes, got "${v}"`);
      waitMin = Number(v);
    } else fail(`Unknown argument "${a}"`);
  }
  if (issue === null) fail("Usage: npm run newsletter:send -- --issue N [--dry-run] [--test-to you@x.co] [--wait-min 15]");
  if (dryRun && testTo) fail("Use either --dry-run or --test-to, not both");
  return { issue, dryRun, testTo, waitMin };
}

function loadPosts(): Map<string, PostMeta> {
  const map = new Map<string, PostMeta>();
  for (const entry of readPostEntries()) {
    const parsed = PostMetaSchema.safeParse(entry.meta);
    if (parsed.success) map.set(parsed.data.slug, parsed.data);
    else console.warn(`Warning: app/blog/${entry.dir}/post.json is invalid (run npm run blog:check); skipped`);
  }
  return map;
}

function loadIssue(n: number, posts: Map<string, PostMeta>): Issue {
  const file = path.join(ISSUES_DIR, issueFileName(n));
  if (!fs.existsSync(file)) fail(`No issue file at ${file}`);
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    fail(`${file} is not valid JSON: ${(err as Error).message}`);
  }
  const result = validateIssue(raw, file, posts);
  if (!result.ok) fail(`${file} is not valid:\n${result.errors.map((e) => `- ${e}`).join("\n")}`);
  return result.issue;
}

function toIssuePosts(issue: Issue, posts: Map<string, PostMeta>): IssuePost[] {
  const base = site.url.replace(/\/+$/, "");
  return issue.posts.map(({ slug, blurb }) => ({
    slug,
    title: posts.get(slug)!.title,
    blurb,
    url: `${base}/blog/${slug}`,
    imageUrl: `${base}${ogImagePath(slug)}`,
  }));
}

/** tsx does not load .env files the way Next does; the network paths need the server env. */
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    if (fs.existsSync(f)) process.loadEnvFile(f);
  }
}

async function isLive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const postMap = loadPosts();
  const issue = loadIssue(args.issue, postMap);
  const posts = toIssuePosts(issue, postMap);
  const email = renderIssueEmail(issue, posts, site.url);

  console.log(`Edición ${issue.issue} (${issue.date})`);
  console.log(`  Subject:   ${issue.subject}`);
  console.log(`  Preheader: ${issue.preheader}`);
  for (const p of posts) console.log(`  - ${p.title}\n    ${p.url}`);

  if (args.dryRun) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    const out = path.join(PREVIEW_DIR, issueFileName(issue.issue).replace(/\.json$/, ".html"));
    fs.writeFileSync(out, email.html);
    console.log(`Dry run: nothing sent. Preview written to ${out}`);
    return;
  }

  loadEnv();
  const resend = await import("../../src/lib/newsletter/resend");

  if (args.testTo) {
    await resend.sendEmail({ to: args.testTo, subject: `[Prueba] ${email.subject}`, html: email.html, text: email.text });
    console.log(`Test email sent to ${args.testTo}. No claim was made; the issue can still be broadcast.`);
    return;
  }

  const db = await import("../../src/lib/newsletter/db");
  const result = await sendIssue(
    issue,
    posts,
    { siteUrl: site.url, waitMs: Math.round(args.waitMin * 60_000), pollMs: POLL_MS },
    {
      claimSend: db.claimSend,
      markSent: db.markSent,
      isLive,
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
      sendBroadcast: resend.sendBroadcast,
      log: (m) => console.log(m),
    },
  );
  console.log(`Result: ${result}`);
  process.exit(result === "sent" || result === "already-sent" ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

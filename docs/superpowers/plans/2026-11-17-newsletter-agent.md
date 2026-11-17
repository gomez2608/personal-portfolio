# Newsletter Agent Pipeline Implementation Plan (Plan 3 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every two weeks an agent proposes papers in a GitHub issue. Labelling it `aprobado` makes the agent draft the posts, clips and issue file in a PR, and labelling the PR `revisar` makes it apply Sebastián's comments. His opinion enters only through a `/opinion` comment that a non-AI workflow copies verbatim. A merge publishes the posts and sends the newsletter (Plan 2).

**Architecture:**
- **The AI steps** are three Claude Code scheduled tasks (cloud, on Sebastián's personal plan). Each one runs a versioned instruction file in `newsletter/agent/`.
- **The mechanical steps** are plain GitHub Actions with no AI:
  - copy `/opinion` comments into `post.json`;
  - PR checks (tests, lint, build, `blog:check`, opinion guard);
  - the existing send workflow.
- **The opinion moves from MDX into `post.json`** (`opinion` field), so a guard can verify that only the `/opinion` workflow changed it.
- **Clips switch to the full frame:** snapshots show captions under the stage, like the live player.

**Tech Stack:** Claude Code scheduled tasks (web), GitHub Actions, tsx scripts, Vitest, Playwright (cloud env uses `CHROME_PATH`).

**Spec:** `docs/superpowers/specs/2026-11-13-ai-newsletter-blog-design.md` §6.1–6.4 (runtime: Claude Code scheduled tasks, label triggers, Gmail notifications, mechanical gates). Plans 1–2 are merged. Decisions since the spec:
- Sebastián's plan is personal.
- Clips use the full frame.
- The opinion lives in `post.json` (this plan updates the spec text).

## Global Constraints

- The agent **never**:
  - pushes to `master`, merges, or edits `opinion` fields;
  - writes in Sebastián's voice;
  - names employer clients;
  - publishes without both labels' gates.
  Branches are `edicion-NNNN` (4-digit issue number).
- Labels: `newsletter` (candidate issues), `aprobado` (on a candidate issue: start drafting), `revisar` (on a draft PR: apply comments).
- The `/opinion` command, in a PR comment by `gomez2608`, is `/opinion <slug>` followed by a newline, then the text. It is copied **verbatim** into `app/blog/<slug>/post.json` → `opinion` (string, 1–1500 chars) by the `opinion` workflow, committing as `github-actions[bot]` with the message `opinion: <slug>`.
- A published post requires a non-empty `opinion`. A PR fails if any `opinion` value changed in a commit not authored by `github-actions[bot]` with a message starting `opinion: `.
- Clip conventions:
  - full 1280×720 stage at runtime and in snapshots;
  - captions ≤70 chars, shown under the stage;
  - labels ≥34px (Node sub-labels included);
  - tangerine is never text.
- Posts are Spanish (Latin American), for curious non-experts. Technical terms stay in English with a Spanish gloss on first use. Every factual claim must be traceable to the paper or a cited source.
- Cadence: cron `CRON_TZ=America/Bogota 0 9 1,15 * *`.
- Branch `feat/newsletter-agent`. Commit trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Someone other than Sebastián comments `/opinion`,** or the agent posts it through the Claude GitHub App: no copy. The workflow requires `comment.user.login == "gomez2608"` and `performed_via_github_app == null`. → `parseOpinionCommand` and workflow condition tests, Task 3.
2. **An `/opinion` for a slug not in the PR,** an empty text, or text over 1500 chars: a clear reply comment, and nothing is committed. → `applyOpinion` tests, Task 3.
3. **The agent edits an opinion in a normal commit:** the PR check fails and names the commit. → `findIllegalOpinionEdits` tests, Task 3.
4. **A published post with no opinion reaches a PR:** `blog:check` fails with a Spanish hint to use `/opinion`. → validator test, Task 2.
5. **The cloud environment has no Playwright-downloaded browser:** `blog:snap` uses `CHROME_PATH` when it's set. → `resolveChromePath` test, Task 1.

---

## File Structure

```
app/components/blog/clips/primitives/node.tsx        sub-label 34px
app/blog/clip-preview/[slug]/[clip]/frame-view.tsx   caption bar under the stage (no burn-in)
app/components/blog/clips/clip-frame.tsx             remove burnCaptions
app/blog/mezcla-de-expertos/*                        re-laid clips; opinion → post.json
src/lib/blog/schema.ts                               PostMeta.opinion
src/lib/blog/validate.ts                             opinion rules on post.json
app/components/blog/post-shell.tsx                   renders opinion from post.json
app/components/blog/mdx/mi-opinion.tsx               deleted (+ mdx-components entry)
src/lib/blog/opinion.ts                              parseOpinionCommand, applyOpinion (pure, tested)
src/lib/blog/opinion-guard.ts                        findIllegalOpinionEdits (pure, tested)
scripts/blog/apply-opinion.ts                        CLI used by the workflow
scripts/blog/opinion-guard.ts                        CLI used by PR checks
scripts/blog/snap.ts                                 CHROME_PATH support
.github/workflows/opinion.yml
.github/workflows/blog-pr-checks.yml
newsletter/agent/{ESTILO.md,candidatos.md,borradores.md,revision.md}
docs/newsletter-automation-setup.md
```

---

### Task 1: Full-frame clips and cloud-friendly snapshots

**Files:** Modify `clip-frame.tsx`, `frame-view.tsx`, `primitives/node.tsx`, `primitives/index.tsx` (JSDoc), `app/blog/mezcla-de-expertos/clips/clip-1.tsx`, `clip-2.tsx`, `scripts/blog/snap.ts`, `CLAUDE.md`. Create `scripts/blog/chrome-path.ts` + test.

**Interfaces:**
- `ClipFrame({ def })`: no `burnCaptions` prop; the stage never draws captions.
- The clip-preview frame view renders the `Thumbnail` with an HTML caption bar **under** it. Same font, size and min-height logic as `ClipPlayer`'s bar, for the active caption at that frame. Total snapshot = stage + bar.
- Node `sub` default size 34px. The JSDoc floor reads "34px for every label, sub-labels included; scenes may use the full 1280×720 stage".
- `resolveChromePath(env: NodeJS.ProcessEnv): string | undefined` returns `env.CHROME_PATH` if it's set and non-empty. `snap.ts` passes it as `executablePath` to `chromium.launch`.

- [ ] **Step 1: Failing test** `chrome-path.test.ts`: returns the path when set, `undefined` when unset or empty.
- [ ] **Step 2: Implement** the test, then the component and script changes.
- [ ] **Step 3: Re-lay both sample clips** to use the full height, with all labels ≥34px. Run `npm run dev` and `npm run blog:snap -- mezcla-de-expertos`, look at every PNG, and iterate until clean: no overlap, nothing clipped, nothing touching the edges.
- [ ] **Step 4: Run** `npm test`, `npm run lint`, `npm run build`, `npm run blog:check` → pass.
- [ ] **Step 5: Commit** `feat(blog): full-frame clips, captions under snapshots, CHROME_PATH for snaps`.

### Task 2: Opinion lives in post.json

**Files:** Modify `src/lib/blog/schema.ts`, `validate.ts` (+ tests), `post-shell.tsx`, `mdx-components.tsx`, `app/blog/mezcla-de-expertos/{page.mdx,post.json}`, `CLAUDE.md`, and the spec. Delete `app/components/blog/mdx/mi-opinion.tsx`.

**Interfaces:**
- `PostMeta.opinion: string | null`. It's required in the JSON, `null` until written, and ≤1500 chars, with no `{{{`/`}}}`.
- `validatePosts`:
  - A published post with `opinion` null or blank → `"<slug>: falta tu opinión. Escribe /opinion <slug> en el PR."`
  - Any MDX still containing `<MiOpinion` → error `"<slug>: MiOpinion ya no se usa; la opinión va en post.json"`.
- `PostShell` renders the opinion after the children and before the Fuente aside:
  - heading "Mi opinión", the text split into paragraphs on blank lines, escaped by React (plain text, no MDX/HTML);
  - when it's null and the post is a draft, the existing "Pendiente: opinión de Sebastián" placeholder (dev and preview only).
- Spec §6.2: replace the "Mi opinión… enforced mechanically" bullet with the post.json + `/opinion` workflow + guard mechanism above, and note why: the agent acts as Sebastián's GitHub user, so author checks can't tell them apart.

- [ ] **Step 1: Failing tests:**
  - schema accepts `opinion: null` and a string;
  - schema rejects 1501 chars and `{{{`;
  - published + null → the Spanish error;
  - published + text → ok;
  - draft + null → ok;
  - an MDX containing `<MiOpinion` → error.
- [ ] **Step 2: Implement.** Migrate the sample post: remove `<MiOpinion pending />` and add `"opinion": null`. Remove the old MiOpinion regexes and tests.
- [ ] **Step 3: Run** `npm test`, `npm run lint`, `npm run build`, `npm run blog:check`. In `npm run dev`, confirm the draft post shows the placeholder.
- [ ] **Step 4: Commit** `feat(blog): opinion moves to post.json`.

### Task 3: /opinion workflow and PR checks

**Files:** Create `src/lib/blog/opinion.ts` + test, `src/lib/blog/opinion-guard.ts` + test, `scripts/blog/apply-opinion.ts`, `scripts/blog/opinion-guard.ts`, `.github/workflows/opinion.yml`, `.github/workflows/blog-pr-checks.yml`.

**Interfaces:**
- `parseOpinionCommand(body: string): { slug: string; text: string } | null`. The first line must match `^/opinion\s+([a-z0-9-]{1,80})\s*$`; the text is everything after the first newline with trailing whitespace trimmed. Otherwise null.
- `applyOpinion(postJson: string, text: string): { ok: true; json: string } | { ok: false; error: string }`:
  - Parses, sets `opinion` to the text, and re-serializes with 2-space indent plus a trailing newline, keeping the other key order.
  - Errors (Spanish): empty, over 1500, contains `{{{`/`}}}`, invalid JSON.
- `findIllegalOpinionEdits(commits: { sha: string; author: string; message: string; opinions: Record<string, string | null> }[], base: Record<string, string | null>): string[]`:
  - Walks the commits in order and compares each one's opinions with the previous state.
  - Any change where `!(author === "github-actions[bot]" && message.startsWith("opinion: "))` → `"<sha7> changed the opinion of <slug>"`.
- `opinion.yml`:
  - Trigger: `issue_comment: created`.
  - Job `if`: `github.event.issue.pull_request && github.event.comment.user.login == 'gomez2608' && github.event.comment.performed_via_github_app == null && startsWith(github.event.comment.body, '/opinion ')`.
  - Steps:
    1. check out the PR head branch (`gh pr view` for the ref);
    2. pass the comment body through env, never interpolated;
    3. run `tsx scripts/blog/apply-opinion.ts`, which reads `COMMENT_BODY` and writes the file or prints an error;
    4. on error, reply with `gh pr comment` and exit 0;
    5. otherwise commit `opinion: <slug>` as `github-actions[bot]`, push to the PR branch, and react 👍 to the comment.
    6. Run `gh workflow run blog-pr-checks.yml --ref <branch>`. A push made with `GITHUB_TOKEN` doesn't trigger other workflows, but `workflow_dispatch` does, so the checks re-run on the new head.
  - `permissions: contents: write, pull-requests: write, actions: write`.
  - Refuses if the slug folder isn't in the PR's changed files.
- `blog-pr-checks.yml`:
  - Triggers: `pull_request` to master, plus `workflow_dispatch` (used by `opinion.yml`).
  - Runs `npm ci`, `npm test`, `npm run lint`, `npm run blog:check`, `npm run build`, then `tsx scripts/blog/opinion-guard.ts`.
  - The guard builds the commit list for `base..head` with `git log --reverse --format=...` and reads every `app/blog/*/post.json` `opinion` at each commit via `git show`.
  - Base is `merge-base origin/master HEAD`, so both triggers give the same result; checkout uses `fetch-depth: 0`.
  - The job name is fixed as `blog-pr-checks`, so a ruleset can require it.
  - `permissions: contents: read`. No secrets.

- [ ] **Step 1: Failing tests:**
  - `parseOpinionCommand`: valid, extra spaces, missing text, uppercase slug, no newline;
  - `applyOpinion`: sets the text, preserves the other fields and key order, and errors for each case;
  - `findIllegalOpinionEdits`: a bot commit with the right message is ok; a bot commit with the wrong message is flagged; a gomez2608 commit changing an opinion is flagged; an unchanged opinion in other commits is ok; a new post's first opinion set by the bot is ok.
- [ ] **Step 2: Implement.**
- [ ] **Step 3: Validate** both workflows with `npx --yes @action-validator/cli`. Simulate the guard in a scratch git repo: one bot commit plus one human commit editing an opinion → exit 1 naming the human commit.
- [ ] **Step 4: Run** `npm test`, `npm run lint`, `npm run build` → pass.
- [ ] **Step 5: Commit** `feat(newsletter): /opinion workflow and PR checks`.

### Task 4: Agent instruction files

**Files:** Create `newsletter/agent/ESTILO.md`, `candidatos.md`, `borradores.md`, `revision.md`.

**Interfaces:** each task file starts with "Lee primero `newsletter/agent/ESTILO.md` y `CLAUDE.md`" and ends with the email notification step. Written in Spanish (the agent writes Spanish content), with commands in English.

- **`ESTILO.md`:**
  - Reader and purpose (spec §1–2).
  - Voice (clear, warm, no hype, no jargon without a gloss).
  - Post structure (spec §4.2, mirroring `app/blog/mezcla-de-expertos` as the reference).
  - Clip conventions (Global Constraints; build only from `primitives/`; mechanism-diagram style; 2–3 clips of 10–20 s).
  - Accuracy rules: every claim traceable; the PR description lists the claims with sources; no results beyond the abstract and paper; verify the paper URL, title and authors.
  - The hard "never" list (Global Constraints).
  - The repo commands to run.
- **`candidatos.md`** (scheduled task):
  1. Next issue number = max of `newsletter/issues/*.json` and of open/closed issues labelled `newsletter`, plus one. If an open `newsletter` issue without a merged PR exists, comment on it ("Nueva ventana de candidatos disponible; esta edición sigue abierta") and stop.
  2. Research the last ~15 days: arXiv cs.AI/cs.CL/cs.LG/cs.CV listings, Hugging Face daily papers, Papers with Code trending, major lab blogs. Skip anything already covered in `app/blog/*/post.json` (`paper.url`).
  3. Pick 6–8 candidates. For each: title, link, 2-line summary (ES), why it matters, a 1–5 score for "¿lo entiende un curioso sin formación?", and a proposed angle and clip idea.
  4. Create the issue via `gh api` REST: title `Edición NNNN — candidatos`, label `newsletter`, a checkbox per candidate, and the instruction "Marca 3–4 y añade la etiqueta `aprobado`".
  5. Email Sebastián (Gmail connector) with the issue link.
- **`borradores.md`** (GitHub trigger: issue labelled `aprobado`):
  1. Read the issue; take only the checked candidates (3–4). If fewer than 1 or more than 4, comment asking to fix the selection, remove `aprobado`, and stop.
  2. Create branch `edicion-NNNN` from the latest `master`.
  3. For each pick, write `app/blog/<slug>/` (post.json `status: "published"`, `opinion: null`, `issue: NNNN`; page.mdx; clips), following ESTILO and the reference post.
  4. Write `newsletter/issues/NNNN.json` (subject, preheader, intro, blurbs).
  5. Run `npm ci`, `npm test`, `npm run lint`, `npm run build`, `npm run blog:registry`, then `npm run dev` in the background and `npm run blog:snap -- <slug>` for each post. Look at every PNG and fix, and repeat until clean. Then run `npm run newsletter:send -- --issue NNNN --dry-run` and open the preview. `blog:check` is expected to fail only on the missing opinions; everything else must pass.
  6. Push and open a PR via `gh api` REST: title `Edición NNNN`, body = per-post summary, claims with sources, the preview link note, and "Escribe tu opinión con /opinion <slug> en un comentario". Link it to the issue.
  7. Comment on the issue with the PR link, and email Sebastián.
- **`revision.md`** (GitHub trigger: PR labelled `revisar`, head `edicion-*`):
  1. Read the PR comments and review comments since the agent's last comment that starts "Revisión aplicada". Ignore `/opinion` comments.
  2. Apply the requests, then re-run the checks and snaps from `borradores` step 5.
  3. Push, comment "Revisión aplicada: …" with a bullet summary, remove the `revisar` label, and email Sebastián.
  4. Never touch `opinion`.

- [ ] **Step 1: Write the four files.** Keep each task file under ~120 lines; ESTILO under ~200.
- [ ] **Step 2: Self-check.** Every command named exists in `package.json`, every path exists, and the labels and branch names match the Global Constraints. Run `npm run lint` (no change expected).
- [ ] **Step 3: Commit** `docs(newsletter): agent instructions for candidates, drafts and revisions`.

### Task 5: Automation setup guide and docs

**Files:** Create `docs/newsletter-automation-setup.md`. Modify `CLAUDE.md` and `docs/newsletter-setup.md` (link to it).

**Interfaces:** the guide is a checklist in English, in this order:
1. Prerequisite: `docs/newsletter-setup.md` is done.
2. Make `gomez2608/personal-portfolio` private. Confirm that Vercel still deploys, that the CV pipeline's deploy key still pushes `public/resume.pdf`, and that Actions minutes stay within the free tier.
3. Add a ruleset on `master`: require a PR plus the `blog-pr-checks` check, with bypass for **deploy keys** so the CV pipeline keeps working, and block force pushes.
4. Create the labels `newsletter`, `aprobado`, `revisar`.
5. Install the **Claude GitHub App** on the repo, and connect through it rather than `/web-setup`, so the agent's comments carry `performed_via_github_app` and can't trigger `/opinion`.
6. Cloud environment:
   - network: Allowed domains for arxiv.org, export.arxiv.org, huggingface.co, paperswithcode.com, plus lab blogs (or Full);
   - setup script: `npm ci`;
   - no secrets: the agent never sends email or touches the database.
7. Attach the Gmail connector.
8. Create the three scheduled tasks, each with the exact trigger and filter and the prompt "Sigue `newsletter/agent/<file>.md` al pie de la letra.":
   - **Candidatos:** schedule `CRON_TZ=America/Bogota 0 9 1,15 * *`.
   - **Borradores:** GitHub, Issue labeled, label `aprobado`.
   - **Revisión:** GitHub, Pull request labeled, label `revisar`, head branch `edicion-*`.
9. Rehearsal:
   1. "Run now" on Candidatos.
   2. Tick 3 boxes and add `aprobado`.
   3. Review the PR preview, comment, add `revisar`.
   4. `/opinion` for each post.
   5. Checks go green.
   6. Merge; the send workflow runs (consider a first issue with only yourself subscribed).
10. Fallback if scheduled tasks change: the same instruction files with `anthropics/claude-code-action` and an API key (outline the 3 workflows).
11. How to pause: disable the tasks.

`CLAUDE.md` gains:
- `newsletter/agent/`;
- the two new workflows;
- the opinion rule (post.json, `/opinion` only);
- the full-frame clip convention.

- [ ] **Step 1: Write.**
- [ ] **Step 2: Run** `npm test`, `npm run lint`, `npm run build` → pass.
- [ ] **Step 3: Commit** `docs(newsletter): automation setup guide`.

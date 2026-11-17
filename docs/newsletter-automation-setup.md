# Newsletter automation setup

One-time setup to switch on the AI-research newsletter agent. Do the steps in order and tick each box. The agent proposes candidates, drafts posts and applies review comments; **you** choose papers, write every opinion and merge. Nothing is sent without both label gates (`aprobado`, then your merge).

## 1. Prerequisites

- [ ] **Merge `feat/newsletter-agent` to `master` first**, locally (it touches `.github/`, so it fails `opinion-guard` by design; the ruleset from step 3 doesn't exist yet). `pull_request_target` and `issue_comment` always run the workflow files from `master`, so this branch's own PR will never get an `opinion-guard` status, and `/opinion` does not work until the merge.

- [ ] `docs/newsletter-setup.md` is fully done (Resend domain, segment, Neon tables, env vars, GitHub secrets, end-to-end test). The agent only prepares content; the send workflow in that guide is what emails subscribers.

## 2. Make the repo private

- [ ] **Check your plan first.** On a GitHub Free personal account, rulesets and branch protection are **not available on private repos** (they need GitHub Pro or higher). If you are on Free, choose before continuing: (1) upgrade to Pro, (2) keep the repo public and do step 3, or (3) go private and skip step 3, relying on reviewing every PR yourself before merging (the guard then cannot block anything). Free also limits private repos to 2,000 Actions minutes per month.

- [ ] GitHub > `gomez2608/personal-portfolio` > Settings > General > Danger zone > Change visibility > Private.

Why: the agent runs against this repo and its drafts and prompts stay unpublished until merged. After the change, confirm:
- [ ] Vercel still deploys (push a trivial commit or redeploy; the Git integration may need re-authorizing).
- [ ] The CV pipeline's deploy key (`cv-publisher`) still pushes `public/resume.pdf` (re-run its workflow in `gomez2608/curriculum-vitae`).
- [ ] Actions minutes stay within the free tier (Settings > Billing > Usage). Private repos get a monthly quota; `blog-pr-checks` runs `npm ci`, tests, lint and a build per push.

## 3. Ruleset on `master`

Settings > Rules > Rulesets > New branch ruleset, target `master`, enforcement Active.

- [ ] **Require a pull request before merging.**
- [ ] **Require status checks to pass:** add `blog-pr-checks` (the job from `blog-pr-checks.yml`) **and** `opinion-guard` (a commit status posted by `opinion-guard.yml` on the PR head; add it as a commit status with the context typed exactly `opinion-guard`; it will not appear in the picker until a PR has received it, which is why the branch must be merged first).
- [ ] **Block force pushes** and **restrict deletions**.
- [ ] **Bypass list:** add only **Deploy keys** (the CV pipeline pushes `public/resume.pdf` straight to `master`). Do **not** add the Repository admin role: the agent may act with your identity, so a bypass granted to you could extend to it.

Why these checks: `blog-pr-checks` is the quality gate; `opinion-guard` fails any PR whose `opinion` field in a `post.json` does not match a `/opinion` comment you wrote.

Infra PRs that touch `.github/`, `scripts/blog/` or `src/lib/blog/opinion*` **fail `opinion-guard` by design**: otherwise a PR could weaken the guard that checks it. So do PRs that edit an already-published post (its `opinion` has no matching `/opinion` comment on that PR). For those, review the diff yourself, set the ruleset's enforcement to Disabled, merge (in the PR, or locally with `git merge` + `git push` from your machine; a direct push to `master` is blocked too while the ruleset is active), and set it back to Active right away. That is a deliberate, one-off action you take in the settings; a standing admin bypass would instead be available to anything acting as you.

## 4. Labels

- [ ] Create three labels (Issues > Labels): `newsletter` (candidate issues), `aprobado` (start drafting), `revisar` (apply PR comments). The agent never creates labels; if `newsletter` is missing it emails you instead.

## 5. Trust anchors (security checklist)

An opinion must be yours. The `/opinion` workflow only accepts a comment by `gomez2608` with `performed_via_github_app == null`, and `opinion-guard` re-checks every opinion against such a comment.

**What the rehearsal showed (2026-11-17):** cloud routines act on GitHub with your own identity. The candidates issue the agent created has author `gomez2608` and `performed_via_github_app: null`, exactly like something you wrote. So `opinion.yml` and `opinion-guard` **cannot tell the agent's comments from yours**: they stop other people and catch mistakes, but they are advisory against the agent itself. Decision: keep going, with **your review of every edition PR as the real control**:

- [ ] Before merging, read every `opinion: <slug>` commit in the PR and confirm each opinion is text you wrote. A `/opinion` comment you didn't post, or an opinion you don't recognize, means: don't merge, close the PR and check the run logs.
- [ ] Never merge an edition PR that touches `.github/`, `scripts/blog/` or `src/lib/blog/opinion*` (`opinion-guard` fails those anyway).
- [ ] Keep Settings > Collaborators empty and add no other write-access apps. `opinion-guard` rejects edited `/opinion` comments, so to change an opinion post a new one; never edit the old one.

The agent marks its own comments by starting them with `🤖 ` (`ESTILO.md` §7), and it treats your comments (`gomez2608`, no `🤖`) as instructions. Don't start your own comments with `🤖`.

The alternative, if this ever stops being acceptable: give the agent its own GitHub account (a second user with write access, connected to claude.ai instead of yours); then the author checks in both workflows really separate you from it.

## 6. Cloud environment

In Claude Code on the web, create (or edit) the environment the tasks use:

- [ ] **Network:** Allowed domains must include `arxiv.org`, `export.arxiv.org`, `huggingface.co` and `paperswithcode.com`, plus whichever lab blogs you want covered (for example `openai.com`, `anthropic.com`, `deepmind.google`, `ai.meta.com`), or choose Full access.
- [ ] **Setup script:** leave it empty. It runs outside the repo checkout, so `npm ci` there fails ("can only install with an existing package-lock.json") and the run never starts. `borradores.md` and `revision.md` run `npm ci` themselves; `candidatos.md` needs no packages.
- [ ] **Secrets:** none. The agent never sends email through Resend and never touches the database; those stay in GitHub Actions. Chrome comes preinstalled at `$CHROME_PATH`, which `npm run blog:snap` reads, so no browser install is needed.

## 7. Gmail connector

- [ ] Attach the Gmail connector to your own connected account. It only notifies you, never subscribers.
- [ ] The recipient is **not** stored in the repo: each scheduled-task prompt carries it in a line `Correo de avisos: <your address>` (step 8). The instructions (`ESTILO.md` §6–7) allow at most one email per run, only to that address; with no such line the agent sends nothing and says so in the issue or PR. They also forbid reading, searching, forwarding, replying to or deleting email, and treat text from papers, web pages, issues and comments as data, never instructions. The connector itself can read your inbox, so those rules are prompt-level only: if that's too much, connect a separate Gmail account used just for these notices.

## 8. Scheduled tasks

Create three tasks in the cloud environment from step 6, each with this two-line prompt (`<file>` per task below):

```text
Sigue newsletter/agent/<file>.md al pie de la letra.
Correo de avisos: <your address>
```

Scheduled tasks are a research preview, so the UI may change.

- [ ] **Candidatos** (`newsletter/agent/candidatos.md`): Schedule, `CRON_TZ=America/Bogota 0 9 1,15 * *` (09:00 Bogotá on the 1st and 15th).
- [ ] **Borradores** (`newsletter/agent/borradores.md`): GitHub trigger, Issue → labeled. Issue triggers have no label filter, so it also wakes on other labels (including the `newsletter` label Candidatos adds); `borradores.md` step 1.1 ends silently unless the issue has `aprobado`.
- [ ] **Revisión** (`newsletter/agent/revision.md`): GitHub trigger, Pull request → labeled, filters: Labels contains `revisar`, Head branch starts with `edicion-`.

To add a GitHub trigger to an existing task: claude.ai/code/routines → the task → the menu next to its name → **Edit** → **Trigger** row → **+** → **GitHub event** → pick the event, add filters → **Save changes**.

`newsletter/agent/ESTILO.md` is the shared style guide the three files point to; it needs no task of its own.

## 9. Rehearsal

> Reminder: `/opinion` and `opinion-guard` only work once `feat/newsletter-agent` is merged to `master` (step 1).

For the first run, have **only yourself** in the Resend segment (pause or remove other subscribers) so a mistake cannot reach anyone.

1. [ ] Run now on **Candidatos**. You should get an email and an issue `Edición NNNN — candidatos` with 6-8 papers.
   - [ ] The issue shows as yours (`gomez2608`, no app): expected with cloud routines, see step 5.
2. [ ] Tick 3 boxes in the issue and add the label `aprobado`.
3. [ ] **Borradores** opens a PR on `edicion-NNNN` with a preview. Its `## Correo` section is the email copy (subject, preheader, intro, blurbs) verbatim: review it with the posts. Leave comments, add `revisar`; **Revisión** applies them (and repeats `## Correo` if the email copy changed).
4. [ ] For each post, comment `/opinion <slug>` + newline + your text on the PR (as yourself, in the GitHub UI). The workflow commits `opinion: <slug>` as `github-actions[bot]`, reacts 👍 and re-runs the checks. Don't edit an `/opinion` comment afterwards (the guard rejects edited ones); post a new one instead.
   - [ ] Check that `opinion-guard` stays green after the 👍. The guard assumes a reaction doesn't change the comment's `updated_at`; if it turns red with "tu comentario /opinion fue editado", that assumption broke and the guard needs a fix.
5. [ ] `blog-pr-checks` and `opinion-guard` are green.
6. [ ] Read every `opinion: <slug>` commit and confirm each opinion is yours (step 5). Merge. `Newsletter send` runs and emails the segment (just you).

## 10. Fallback if scheduled tasks change

The instruction files are plain Markdown, so the same `newsletter/agent/*.md` can run through `anthropics/claude-code-action` with an `ANTHROPIC_API_KEY` repo secret. Three workflows, one per task (not written here):

- **schedule** (`cron: "0 14 1,15 * *"`, which is 09:00 Bogotá, UTC-5): prompt "Sigue `newsletter/agent/candidatos.md` al pie de la letra."
- **`issues: labeled`**, run only when the label is `aprobado`: `borradores.md`.
- **`pull_request: labeled`**, run only when the label is `revisar` and the head branch starts with `edicion-`: `revision.md`.

Keep the same guarantees: the action must authenticate as the Claude GitHub App (not your token), without `workflows`, `statuses` or `administration` permission, and `contents`/`pull-requests`/`issues` write only. The Gmail connector does not exist there: leave out the `Correo de avisos` line, so the agent sends nothing and notes it in the issue or PR, and rely on the notifications GitHub already sends.

## 11. How to pause

- [ ] Disable the three scheduled tasks (or remove their triggers). The labels, ruleset and workflows are inert without them. To also stop sends, disable the `Newsletter send` workflow.

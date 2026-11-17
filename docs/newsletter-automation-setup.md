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

An opinion must be yours. The `/opinion` workflow only accepts a comment by `gomez2608` with `performed_via_github_app == null`, and `opinion-guard` re-checks every opinion against such a comment. These three conditions keep the agent from forging that:

- [ ] **(a) Connect the agent through the Claude GitHub App, not `/web-setup`.** Install the app on this repo only (github.com/apps/claude, or Claude Code `/install-github-app`). Why: `/web-setup` hands the agent your personal token, so its comments would look like yours and could satisfy `/opinion`. Comments made through the app carry `performed_via_github_app`, and the workflow ignores those.
- [ ] **(b) The app installation must lack `Workflows`, `Commit statuses` write and `Administration`.** Check: GitHub > Settings > Applications > Installed GitHub Apps > Claude > Configure, then read the permissions list. Why: `Workflows` lets the agent edit `.github/workflows/*` (for example neutralize the guard); `Commit statuses` write lets it post a green `opinion-guard` status itself; `Administration` lets it edit or disable the ruleset. If the app requests any of them on an update, **decline** it. The trade-off: without `Workflows`, any workflow change is yours to make by hand; none of the three is needed for this automation. If the Claude app does have `Commit statuses: write`, the guard is only advisory against the agent, and your own review of each PR before merging is the real control.
- [ ] **(c) Nobody else has write access to the repo (defence in depth).** The guard only matches comments authored by `gomez2608`, so another user cannot forge one. But anyone with write access can edit or delete comments, push to a PR branch, and approve or merge, which undermines the review the guard assumes. `opinion-guard` rejects any `/opinion` comment that was edited (`updated_at` differs from `created_at`), so to change an opinion, post a new `/opinion` comment; never edit the old one. Keep Settings > Collaborators empty and add no other write-access apps. The Claude app itself does have write access (that is how it opens PRs); that is acceptable because its comments carry `performed_via_github_app` and, per (b), it cannot edit workflows, post statuses or change the ruleset.

## 6. Cloud environment

In Claude Code on the web, create (or edit) the environment the tasks use:

- [ ] **Network:** Allowed domains must include `arxiv.org`, `export.arxiv.org`, `huggingface.co` and `paperswithcode.com`, plus whichever lab blogs you want covered (for example `openai.com`, `anthropic.com`, `deepmind.google`, `ai.meta.com`), or choose Full access.
- [ ] **Setup script:** `npm ci`.
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
- [ ] **Borradores** (`newsletter/agent/borradores.md`): GitHub trigger, Issue labeled, label `aprobado`.
- [ ] **Revisión** (`newsletter/agent/revision.md`): GitHub trigger, Pull request labeled, label `revisar`, head branch `edicion-*`.

`newsletter/agent/ESTILO.md` is the shared style guide the three files point to; it needs no task of its own.

## 9. Rehearsal

> Reminder: `/opinion` and `opinion-guard` only work once `feat/newsletter-agent` is merged to `master` (step 1).

For the first run, have **only yourself** in the Resend segment (pause or remove other subscribers) so a mistake cannot reach anyone.

1. [ ] Run now on **Candidatos**. You should get an email and an issue `Edición NNNN — candidatos` with 6-8 papers.
   - [ ] Check that the agent used the Claude App: `gh api repos/gomez2608/personal-portfolio/issues/<n> --jq .performed_via_github_app.slug` must print a slug, not `null`. **If it prints `null`, stop**: the agent isn't acting through the App, so `opinion.yml` and `opinion-guard` can't tell its comments from yours. Fix step 5(a) before going on.
2. [ ] Tick 3 boxes in the issue and add the label `aprobado`.
3. [ ] **Borradores** opens a PR on `edicion-NNNN` with a preview. Its `## Correo` section is the email copy (subject, preheader, intro, blurbs) verbatim: review it with the posts. Leave comments, add `revisar`; **Revisión** applies them (and repeats `## Correo` if the email copy changed).
4. [ ] For each post, comment `/opinion <slug>` + newline + your text on the PR (as yourself, in the GitHub UI). The workflow commits `opinion: <slug>` as `github-actions[bot]`, reacts 👍 and re-runs the checks. Don't edit an `/opinion` comment afterwards (the guard rejects edited ones); post a new one instead.
   - [ ] Check that `opinion-guard` stays green after the 👍. The guard assumes a reaction doesn't change the comment's `updated_at`; if it turns red with "tu comentario /opinion fue editado", that assumption broke and the guard needs a fix.
5. [ ] `blog-pr-checks` and `opinion-guard` are green.
6. [ ] Merge. `Newsletter send` runs and emails the segment (just you).

## 10. Fallback if scheduled tasks change

The instruction files are plain Markdown, so the same `newsletter/agent/*.md` can run through `anthropics/claude-code-action` with an `ANTHROPIC_API_KEY` repo secret. Three workflows, one per task (not written here):

- **schedule** (`cron: "0 14 1,15 * *"`, which is 09:00 Bogotá, UTC-5): prompt "Sigue `newsletter/agent/candidatos.md` al pie de la letra."
- **`issues: labeled`**, run only when the label is `aprobado`: `borradores.md`.
- **`pull_request: labeled`**, run only when the label is `revisar` and the head branch starts with `edicion-`: `revision.md`.

Keep the same guarantees: the action must authenticate as the Claude GitHub App (not your token), without `workflows`, `statuses` or `administration` permission, and `contents`/`pull-requests`/`issues` write only. The Gmail connector does not exist there: leave out the `Correo de avisos` line, so the agent sends nothing and notes it in the issue or PR, and rely on the notifications GitHub already sends.

## 11. How to pause

- [ ] Disable the three scheduled tasks (or remove their triggers). The labels, ruleset and workflows are inert without them. To also stop sends, disable the `Newsletter send` workflow.

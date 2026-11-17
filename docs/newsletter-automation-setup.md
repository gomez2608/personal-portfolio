# Newsletter automation setup

One-time setup to switch on the AI-research newsletter agent. Do the steps in order and tick each box. The agent proposes candidates, drafts posts and applies review comments; **you** choose papers, write every opinion and merge. Nothing is sent without both label gates (`aprobado`, then your merge).

## 1. Prerequisite

- [ ] `docs/newsletter-setup.md` is fully done (Resend domain, segment, Neon tables, env vars, GitHub secrets, end-to-end test). The agent only prepares content; the send workflow in that guide is what emails subscribers.

## 2. Make the repo private

- [ ] GitHub > `gomez2608/personal-portfolio` > Settings > General > Danger zone > Change visibility > Private.

Why: the agent runs against this repo and its drafts and prompts stay unpublished until merged. After the change, confirm:
- [ ] Vercel still deploys (push a trivial commit or redeploy; the Git integration may need re-authorizing).
- [ ] The CV pipeline's deploy key (`cv-publisher`) still pushes `public/resume.pdf` (re-run its workflow in `gomez2608/curriculum-vitae`).
- [ ] Actions minutes stay within the free tier (Settings > Billing > Usage). Private repos get a monthly quota; `blog-pr-checks` runs `npm ci`, tests, lint and a build per push.

## 3. Ruleset on `master`

Settings > Rules > Rulesets > New branch ruleset, target `master`, enforcement Active.

- [ ] **Require a pull request before merging.**
- [ ] **Require status checks to pass:** add `blog-pr-checks` (the job from `blog-pr-checks.yml`) **and** `opinion-guard` (a commit status posted by `opinion-guard.yml` on the PR head; if it is not in the picker yet, run the workflow once on a PR so GitHub has seen it, or type the name).
- [ ] **Block force pushes** and **restrict deletions**.
- [ ] **Bypass list:** add **Deploy keys** (the CV pipeline pushes `public/resume.pdf` straight to `master`) and the **Repository admin** role (you).

Why these checks: `blog-pr-checks` is the quality gate; `opinion-guard` fails any PR whose `opinion` field in a `post.json` does not match a `/opinion` comment you wrote.

Infra PRs that touch `.github/`, `scripts/blog/` or `src/lib/blog/opinion*` **fail `opinion-guard` by design**: otherwise a PR could weaken the guard that checks it. Merge those yourself with the admin bypass (the "Merge without waiting for requirements" option), or locally.

## 4. Labels

- [ ] Create three labels (Issues > Labels): `newsletter` (candidate issues), `aprobado` (start drafting), `revisar` (apply PR comments). The agent never creates labels; if `newsletter` is missing it emails you instead.

## 5. Trust anchors (security checklist)

An opinion must be yours. The `/opinion` workflow only accepts a comment by `gomez2608` with `performed_via_github_app == null`, and `opinion-guard` re-checks every opinion against such a comment. These three conditions keep the agent from forging that:

- [ ] **(a) Connect the agent through the Claude GitHub App, not `/web-setup`.** Install the app on this repo only (github.com/apps/claude, or Claude Code `/install-github-app`). Why: `/web-setup` hands the agent your personal token, so its comments would look like yours and could satisfy `/opinion`. Comments made through the app carry `performed_via_github_app`, and the workflow ignores those.
- [ ] **(b) The app installation must not have the `workflows` permission.** Check: GitHub > Settings > Applications > Installed GitHub Apps > Claude > Configure, then read the permissions list. Why: with it the agent could edit `.github/workflows/*` (for example neutralize the guard) or forge commit statuses. If the app requests `workflows` on an update, **decline** it. The trade-off: without it the agent cannot touch workflow files, so any workflow change is yours to make by hand; the permission is not needed for this automation.
- [ ] **(c) Nobody else has write access to the repo.** Comments are read in their current form, so any collaborator with write access could post a `/opinion`-looking comment as themselves, and the guard only matches the author login `gomez2608`. Keep Settings > Collaborators empty, and do not add other apps with write access.

## 6. Cloud environment

In Claude Code on the web, create (or edit) the environment the tasks use:

- [ ] **Network:** Allowed domains must include `arxiv.org`, `export.arxiv.org`, `huggingface.co` and `paperswithcode.com`, plus whichever lab blogs you want covered (for example `openai.com`, `anthropic.com`, `deepmind.google`, `ai.meta.com`), or choose Full access.
- [ ] **Setup script:** `npm ci`.
- [ ] **Secrets:** none. The agent never sends email through Resend and never touches the database; those stay in GitHub Actions. Chrome comes preinstalled at `$CHROME_PATH`, which `npm run blog:snap` reads, so no browser install is needed.

## 7. Gmail connector

- [ ] Attach the Gmail connector to your own connected account. The agent emails **that same account** (it notifies you, never subscribers), so no recipient config is needed.

## 8. Scheduled tasks

Create three tasks in the cloud environment from step 6, all with the prompt `Sigue newsletter/agent/<file>.md al pie de la letra.`. Scheduled tasks are a research preview, so the UI may change.

- [ ] **Candidatos** (`newsletter/agent/candidatos.md`): Schedule, `CRON_TZ=America/Bogota 0 9 1,15 * *` (09:00 Bogotá on the 1st and 15th).
- [ ] **Borradores** (`newsletter/agent/borradores.md`): GitHub trigger, Issue labeled, label `aprobado`.
- [ ] **Revisión** (`newsletter/agent/revision.md`): GitHub trigger, Pull request labeled, label `revisar`, head branch `edicion-*`.

`newsletter/agent/ESTILO.md` is the shared style guide the three files point to; it needs no task of its own.

## 9. Rehearsal

> `/opinion` and `opinion-guard` only work **after this branch (`feat/newsletter-agent`) is merged to `master`**: `issue_comment` and `pull_request_target` always run the workflow files from the default branch. Merge first (with the admin bypass, since it touches `.github/`), then rehearse.

For the first run, have **only yourself** in the Resend segment (pause or remove other subscribers) so a mistake cannot reach anyone.

1. [ ] Run now on **Candidatos**. You should get an email and an issue `Edición NNNN — candidatos` with 6-8 papers.
2. [ ] Tick 3 boxes in the issue and add the label `aprobado`.
3. [ ] **Borradores** opens a PR on `edicion-NNNN` with a preview. Review it, leave comments, add `revisar`; **Revisión** applies them.
4. [ ] For each post, comment `/opinion <slug>` + newline + your text on the PR (as yourself, in the GitHub UI). The workflow commits `opinion: <slug>` as `github-actions[bot]` and re-runs the checks.
5. [ ] `blog-pr-checks` and `opinion-guard` are green.
6. [ ] Merge. `Newsletter send` runs and emails the segment (just you).

## 10. Fallback if scheduled tasks change

The instruction files are plain Markdown, so the same `newsletter/agent/*.md` can run through `anthropics/claude-code-action` with an `ANTHROPIC_API_KEY` repo secret. Three workflows, one per task (not written here):

- **schedule** (`cron: "0 14 1,15 * *"`, which is 09:00 Bogotá, UTC-5): prompt "Sigue `newsletter/agent/candidatos.md` al pie de la letra."
- **`issues: labeled`**, run only when the label is `aprobado`: `borradores.md`.
- **`pull_request: labeled`**, run only when the label is `revisar` and the head branch starts with `edicion-`: `revision.md`.

Keep the same guarantees: the action must authenticate as the Claude GitHub App (not your token), without `workflows` permission, and `contents`/`pull-requests`/`issues` write only. The Gmail connector does not exist there, so replace the email notification with the issue/PR notifications GitHub already sends.

## 11. How to pause

- [ ] Disable the three scheduled tasks (or remove their triggers). The labels, ruleset and workflows are inert without them. To also stop sends, disable the `Newsletter send` workflow.

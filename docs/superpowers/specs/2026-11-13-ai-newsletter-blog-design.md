# AI research newsletter + explainer blog — design

Date: 2026-11-13 · Status: draft for approval · Owner: Sebastian Gomez

## 1. Intent

Every two weeks, subscribers get a short Spanish-language newsletter about recent AI **research** (papers and new techniques, mostly academic, not product or funding news). Each issue links to 3–4 posts on `sebastiangomezahumada.com/blog`. Each post explains one paper or concept in plain language, with short animated diagram clips doing a big share of the explaining.

The research, the topic shortlist, the drafts and the clips are generated automatically. Sebastian approves twice: first the topics, then the finished drafts. Nothing goes out without both approvals.

**Why:** a mix of three goals, from one piece of work:
- **Audience:** people subscribe because these explainers are clearer than anything else available in Spanish, where this kind of content is scarce.
- **Credibility:** every post shows he can read, judge and explain research.
- **Learning:** the cycle makes him read new papers regularly. That's why the draft review is a real reading step with his own written take, not a rubber stamp.

## 2. Reader

Curious people who want to understand, not specialists:
- **Some technical background** (developers, product people, students): they know the vocabulary and want to really get the idea.
- **No background:** they saw something in the news and want to know what it means.

Researchers and ML engineers are **not** the target; they read the papers themselves.

## 3. Goals, non-goals, anti-goals

**Goals**
- A biweekly issue with 3–4 posts, in Spanish, with as little of Sebastian's time as possible: ~5 min to pick topics, ~1.5–2.5 h to review drafts.
- Posts a non-expert can follow from top to bottom, with an optional "go deeper" layer for the technical reader.
- Clips that look polished and consistent, in the portfolio's brand.
- Low running cost: target ≤ ~$30/month all-in.

**Non-goals (for now)**
- English or bilingual content. The posts are written so they could be translated later; no i18n is built now.
- Interactive clips, the metaphor-illustration style or the kinetic-typography style (all explored and dropped as too expensive per post).
- MP4 export for social media, comments, paid tiers, a custom approval panel on the site (that's the "hybrid" upgrade, see §5).

**Anti-goals: a failure even if everything technically works**
- Anything publishes or sends without Sebastian's explicit approval.
- A post misstates what a paper claims, invents results, or links to a paper or URL that doesn't exist.
- The agent writes Sebastian's personal opinion as if he wrote it.
- Clips with overlapping or cut-off elements, or anything that looks off-brand.
- Topics a curious non-expert can't follow (pure benchmark increments, heavy-math-only results).
- Any mention of Sebastian's employer's clients or confidential work (standing rule for this site).

## 4. What the reader sees

### 4.1 Blog index — `/blog`
A list of posts, newest first: title, one-line hook, date, a still or thumbnail. A newsletter signup box near the top. Spanish UI.

### 4.2 Post — `/blog/<slug>`
```
Title + one-line "por qué te debería importar"
Plain-language intro (includes an everyday metaphor in words)
▶ Clip 1: the big picture
Short explanation
▶ Clip 2: the key mechanism            (2–3 clips per post)
"Por qué importa" paragraph
▸ Profundizar (expandable): technical detail, paper link, authors, date
Mi opinión: one paragraph written by Sebastian
Newsletter signup
```
- Spanish only. Pages under `/blog` must render with `lang="es"` regardless of the site's EN/ES toggle. If the visitor has English selected, show a small note: "Este blog está en español".
- Indexed by search engines (unlike `/mentoria`). Posts appear in `sitemap.ts`, with per-post Open Graph metadata.

### 4.3 Clips
- Style: **the real mechanism as a diagram** in the editorial brand look (Paper background, ink, navy, tangerine as signal only, Manrope + DM Mono), like the "B" mockup approved during brainstorming.
- Each clip is ~10–20 s, plays like a video (no interaction needed), and **autoplays muted and loops when scrolled into view**. It has burned-in Spanish captions and a minimal play/pause control plus a progress bar.
- `prefers-reduced-motion`: don't autoplay. Show the final frame with a play button (consistent with the site's existing reduced-motion rule).
- Clips must follow the site's theme rules: they sit on a fixed Paper-style surface in both light and dark mode, like the project preview card stays fixed dark. Builder decides which, provided contrast holds.

### 4.4 Newsletter email
Spanish. A short intro naming the theme of the issue, then one block per post: title, 2–3 sentences on why it matters, link to the post. Each block has one still image (a frame from the post's first clip, or a branded card if a still is impractical; builder's call). The footer has an unsubscribe link.

### 4.5 Subscribing
- A form on `/blog` and at the end of each post: an email field plus a honeypot, like the contact form.
- **Double opt-in:** the signup sends a confirmation email, and only confirmed addresses get on the list.
- Every newsletter carries an unsubscribe link.
- Rate-limited like `/api/contact`.

## 5. Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | **Git-based.** A scheduled agent opens a GitHub issue with candidates. Approval triggers it to write posts and clips as code in a branch and open a PR. The Vercel preview of that PR is the review page. Merge publishes, and a CI job sends the newsletter. | Least new infrastructure, full code freedom for clips, history for free, could run on Sebastian's Claude plan. Approval happens in GitHub, not on a custom panel. |
| B | **App-based.** Vercel cron + Claude API, drafts in Neon, an `/blog/panel` approval UI like `/mentoria`. Clips are JSON scene descriptions played by a fixed component library, because generated code can't safely run from a database. | Nicest approval UX, but by far the most to build (panel, storage, job runner around Vercel timeouts, scene format). Clips are limited to what the library supports. ~$20–30/mo API. |
| C | **Hybrid.** A's pipeline, plus a small site panel whose buttons trigger the agent and merge the PR via the GitHub API. | Good later upgrade if GitHub approval feels clunky. Nothing in A blocks it. |

Sebastian picked **A**.

## 6. How it works (approach A)

### 6.1 The cycle
```
1st and 15th of each month, 9:00 America/Bogota
 1. RESEARCH   agent scans the last ~2 weeks of research sources
 2. SHORTLIST  6–8 candidates → a GitHub issue "Edición NN — candidatos"
               each: title, link, 2-line summary (ES), why it matters,
               "¿lo entiende un curioso sin formación?" score, proposed angle
               → the agent emails Sebastian (Gmail connector)
 3. PICK       Sebastian ticks 3–4 checkboxes and adds the label `aprobado`
 4. DRAFT      agent writes posts + clips on branch `edicion-NN`,
               runs quality checks, opens a PR linked to the issue,
               emails Sebastian "Borradores listos"
 5. PREVIEW    Vercel builds a protected preview deployment of the PR
 6. REVIEW     Sebastian reads the preview (desktop or phone), leaves change
               requests as PR comments, then adds the label `revisar`; the agent
               revises in the same branch and removes the label;
               Sebastian writes "Mi opinión" for each post via `/opinion`
 7. PUBLISH    Sebastian merges → Vercel deploys /blog posts
 8. SEND       CI on master sends the issue's newsletter via Resend, exactly once
```

### 6.2 Decisions made
- **Runtime (decided by Sebastian): Claude Code scheduled tasks** ([docs](https://code.claude.com/docs/en/web-scheduled-tasks), research preview). They run in Anthropic's cloud on Sebastian's subscription ("draw down subscription usage the same way interactive sessions do"), so there's no API key and no terms ambiguity. **Only on a personal plan, never a work-provided seat.** Three tasks:
  1. **Candidatos:** schedule trigger, cron `CRON_TZ=America/Bogota 0 9 1,15 * *` (cron can't express "every 14 days", so twice a month is used). Steps 1–2.
  2. **Borradores:** GitHub trigger, *Issue labeled* `aprobado` (issues also labeled `newsletter`). Step 4.
  3. **Revisión:** GitHub trigger, *Pull request labeled* `revisar` (head branch `edicion-*`). It reads the PR's comments since the last revision, applies them, and removes the label.
  - Comments can't trigger tasks (only issue, PR and release events can), hence labels.
  - Use `gh api` (REST): the environment's proxy rejects GraphQL-based `gh issue` / `gh pr`.
  - The tasks' cloud environment needs network access to the research sources (arXiv, Hugging Face, lab blogs) via Allowed domains or Full access. Playwright uses the preinstalled Chrome (`CHROME_PATH`). The Claude GitHub App must be installed on the repo.
  - **Notifications:** runs act as Sebastian's GitHub user, so GitHub won't notify him about them. Each task ends by emailing him through the Gmail connector, with a link to the issue or PR.
  - **Fallback:** if scheduled tasks change or break, the same three steps run in GitHub Actions with `anthropics/claude-code-action` (API key with a spend limit). The prompts and repo files are the same, so only the trigger layer changes.
- **Non-AI steps run as plain GitHub Actions** (no Claude, free minutes): copying `/opinion` comments into posts, the PR checks, and sending the newsletter on merge.
- **Approval gates are enforced by mechanics, not prompts:**
  - Drafting starts only from the `aprobado` label. Only users with write access can add labels, and Sebastian is the only one.
  - Revisions start only from the `revisar` label (same restriction).
  - The agent never pushes to `master` and never merges. Branch protection on `master` requires a PR.
  - The send job only runs on `master` after a merge that adds or changes an issue's content.
- **Content in the repo:** each post is a route folder `app/blog/<slug>/` with `page.mdx`, `post.json` and `clips/` (fixed in Plan 1). Each issue also has a small metadata file: issue number, date, post order, intro text, sent status.
- **Clips:** Remotion compositions played in the page with `@remotion/player`, so nothing is rendered to video for the site. They're built from a **small library of brand diagram primitives** written once by hand (labeled box/node, arrow/connector with draw-on, flow dot along a path, highlight/glow, dim others, counter/number, caption track, grouping). The agent composes clips from these primitives and may add custom pieces only when needed. The license is free for individuals (≤3 people), which fits.
- **Quality checks the agent must pass before opening or updating the PR:**
  1. `npm run build` and `npm run lint` pass.
  2. **Visual check of every clip:** render frames at several timestamps (e.g. with Playwright or Remotion stills), look at them, and fix overlap, clipping, unreadable text or off-brand color. Repeat until clean (the research on paper-to-video agents shows layout glitches are the main failure mode).
  3. **Source check:** every paper link resolves and matches the title and authors claimed. Every factual claim about a paper's results can be traced to the paper. The PR description lists, per post, the paper link and the key claims with where they come from.
  4. Spanish copy: natural Latin American Spanish, no anglicisms where a common Spanish term exists. Technical terms stay in English with a short Spanish gloss on first use (e.g. "router (enrutador)").
- **The repo becomes private (decided by Sebastian).** `gomez2608/personal-portfolio` is currently public, which would expose candidate issues, unapproved drafts and review comments. Switching it to private is a setup step. Check that Vercel deploys, the `cv-publisher` deploy key and the Actions minutes (GitHub Free includes 2,000/month for private repos; expected use is ~1–2 h per cycle) all keep working. With a private repo, Vercel preview protection is defense in depth, not the main privacy measure.
- **"Mi opinión" is never written by the agent. This is enforced mechanically.** The agent leaves a clearly marked empty placeholder. Sebastian provides his take in a PR comment of the form `/opinion <slug>` followed by the text. A plain workflow step, with no LLM, checks that the author is `gomez2608` and copies the text verbatim into that post's opinion block, as its own commit. A CI check on the PR fails if any opinion block is empty, or if an opinion block was changed by any commit other than that workflow's (or one authored by `gomez2608`, so he can also edit on desktop). Agent revision runs are instructed never to touch opinion blocks, and the check catches it if they do.
- **Newsletter sending:** Resend (already used for the contact form), with a Resend audience for subscribers, a broadcast per issue and Resend's unsubscribe handling. The send job is **idempotent**: it records that issue NN was sent (e.g. in the issue metadata or by checking Resend) and never sends twice, even if the workflow re-runs.
- **Sending domain (my call):** today the contact form sends from `onboarding@resend.dev`, which only delivers to the account owner. Verifying `sebastiangomezahumada.com` in Resend (DNS records) is the **first setup task** and a hard prerequisite for opt-in emails and broadcasts. Newsletter mail sends from a subdomain, e.g. `boletin@news.sebastiangomezahumada.com`, sender name "Sebastián Gómez", reply-to Sebastian's contact address. That way bulk mail can't hurt the contact form's deliverability.
- **Subscribe flow:** `POST /api/newsletter/subscribe` (zod validation, honeypot, in-memory rate limit, same pattern as `app/api/contact/route.ts`). It stores a pending sign-up and emails a signed confirmation link. `GET /api/newsletter/confirm?token=…` confirms it and adds the contact to the Resend audience, so only confirmed contacts receive broadcasts.
- **Privacy and consent (my call): Colombia's Ley 1581 (habeas data) applies.** The signup forms show short consent wording linked to a new Spanish privacy policy page (`/privacidad`): what is collected (email only), what for (the newsletter), how to unsubscribe and how to request deletion. The policy content needs Sebastian's review before launch. Consent evidence (timestamp, policy version, hashed IP) is stored in a **Neon table** next to the opt-in status, in the existing `personal-portfolio` Neon project.
- **Send timing (my call):** the send job waits until the production deployment that contains the issue is live, so email links never 404. Its "sent" record lives outside `master` (e.g. Neon, or Resend's broadcast list), so it doesn't fight branch protection.
- **Research sources:** arXiv (cs.AI, cs.CL, cs.LG, cs.CV), Hugging Face daily papers, Papers with Code trending, major lab research blogs. News sites only as a signal of what's being discussed. Candidates must be from the last ~2 weeks and not already covered in a previous issue (the agent checks existing posts).
- **Topic filter:** "can this be explained to a curious non-expert?" Pure benchmark gains and math-only results are skipped or mentioned in one line.
- **Nothing on a deadline:** if Sebastian doesn't approve, the issue waits. If a new cycle fires while an issue is still open, the agent comments on the open issue instead of starting a new one.

### 6.3 Site changes
- New routes: `/blog` (index), `/blog/[slug]` (post), plus the two newsletter API routes.
- Header: add a "Blog" link. On `/blog` pages the header's in-page section anchors don't apply, so they need to link back to the home page sections (builder decides how).
- `sitemap.ts`: include posts. `robots.ts`: `/blog` stays indexable.
- The homepage intro animation must not play on `/blog` pages.
- Env: Resend audience ID, a secret for signing confirmation tokens, and the Anthropic credential (GitHub secret), added to `.env.local`, Vercel and GitHub as appropriate, and listed in `CLAUDE.md`.
- Update `CLAUDE.md` with the blog/newsletter architecture.

### 6.4 Operational notes
- `cv-publisher[bot]` also commits to `master`. The agent's branches must rebase on or merge the latest `master` before the PR is updated.
- Vercel preview deployments stay protected (Vercel Authentication) as defense in depth. The builder confirms this is on.
- Setup order: make the repo private → verify the Resend domain → secrets → site pieces → agent workflows → a dry-run issue that never sends to subscribers.
- `.superpowers/` (brainstorm mockups) is gitignored.

## 7. Cost (estimated)

| Item | Per month |
|---|---|
| Claude (scheduled tasks on the personal subscription) | $0 extra; uses plan limits (fallback API path: ~$20–30) |
| Resend | $0 up to 1,000 subscribers, then $40/mo up to 5,000 |
| Remotion, Vercel, Neon, GitHub Actions | $0 (free tiers / existing) |
| Sebastian's time | ~3–5 h (5 min picking + 1.5–2.5 h review per cycle) |

## 8. Left to the builder
- Folder layout for posts and clips, MDX tooling, and how clips are registered and loaded (keep the clip JS out of pages that don't use it).
- The exact primitive set and API of the clip library, and how captions are timed.
- Scheduling mechanics for "every 2 weeks" in cron.
- How the newsletter still image is produced.
- The exact Neon schema for sign-ups and consent.
- Prompt design for the research, drafting and revision agents, including a style guide file in the repo the agent always reads (voice, Spanish conventions, post structure, clip conventions).
- Header/navigation treatment on `/blog`.

## 9. Success looks like
- An issue goes out every ~2 weeks with Sebastian spending ≤ ~3 h on it.
- Sebastian rarely needs more than one round of change requests per post.
- No published factual errors about papers. Clips look clean on desktop and mobile.
- Subscriber count grows. Readers without a technical background can follow the posts (early signal: replies or feedback from non-technical friends).

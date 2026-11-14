# Newsletter Implementation Plan (Plan 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Readers can subscribe to the Spanish newsletter with double opt-in and recorded consent (Ley 1581), and each issue is sent exactly once to confirmed subscribers through Resend after its posts are live.

**Architecture:** Sign-ups and consent evidence live in Neon (`newsletter_subscribers`). A signed, expiring link confirms the address, and only then is the contact added to a Resend segment, which is the send list. Each issue is a JSON file in the repo (`newsletter/issues/NNNN.json`). A script renders it to branded HTML, waits until every linked post returns 200 on the live site, claims the issue in `newsletter_sends` (so a re-run can't send twice), and sends one Resend broadcast. A GitHub Action runs the script when an issue file lands on `master`.

**Tech Stack:** Next.js 15 route handlers, zod 4, `@neondatabase/serverless`, `resend` 6 (contacts, segments, broadcasts), `node:crypto` HMAC, tsx scripts, GitHub Actions, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-ai-newsletter-blog-design.md` (§4.4, §4.5, §6.2 "Sending domain", "Subscribe flow", "Privacy and consent", "Send timing", "Newsletter sending"). Plan 1 (blog) is merged. Plan 3 (the agent pipeline) will write issue files in the format this plan fixes.

## Global Constraints

- All reader-facing copy is **Spanish** (Latin American, natural). Routes: `/privacidad`, `/blog/suscripcion`.
- Sender: `Sebastián Gómez <boletin@news.sebastiangomezahumada.com>`, overridable with `NEWSLETTER_FROM_EMAIL`. Reply-to: `contact@sebastiangomezahumada.com`.
- Double opt-in: a sign-up is `pending` until the link is clicked. Only confirmed addresses are added to the Resend segment `RESEND_NEWSLETTER_SEGMENT_ID`, and only that segment receives broadcasts.
- Consent evidence stored per sign-up: timestamp, policy version `POLICY_VERSION = "2026-11-14"`, and an HMAC-SHA256 hash of the IP (never the raw IP).
- Confirmation links expire after **7 days**.
- Rate limit `/api/newsletter/subscribe` like `/api/contact`: 5 requests / 10 min per IP, in memory.
- **No account enumeration:** a valid request always gets `{ ok: true }`, whatever the address's state.
- An issue is sent **at most once**. The send claims the issue in Neon before calling Resend, and a claimed issue is never retried automatically.
- Brand in emails: inline styles only, with colors from `src/lib/confirmation-email.ts`. Tangerine is never text.
- Every newsletter carries Resend's unsubscribe placeholder `{{{RESEND_UNSUBSCRIBE_URL}}}`.
- Env (server only): `DATABASE_URL`, `RESEND_API_KEY` (existing), `RESEND_NEWSLETTER_SEGMENT_ID`, `NEWSLETTER_SECRET` (≥32 chars, signs links and hashes IPs), `NEWSLETTER_FROM_EMAIL` (optional).
- Branch `feat/newsletter`. Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never commit `.env.local`.

## Review Focus

1. **The same email submitted again** (already pending, confirmed, or unsubscribed through Resend): no duplicate row and no different response. Pending or confirmed gets a fresh link at most once per 10 min, and the link re-adds them to the segment. → `planSubscribe` tests, Task 2.
2. **`  Ana@Example.COM `** and `ana@example.com` are the same subscriber. → `normalizeEmail` test, Task 1.
3. **A tampered, expired or reused confirmation link** shows a friendly Spanish page and changes nothing. Reusing a valid link on a confirmed address says "ya estás suscrito". → token tests (Task 1), `handleConfirm` tests (Task 4).
4. **The send workflow re-runs after a successful or half-failed send:** no second broadcast. A claim left at `sending` stops with a clear message for manual follow-up. → `sendIssue` tests, Task 6.
5. **An issue links a post that isn't published or deployed yet:** nothing is sent. The script waits up to the timeout, then fails with the slug that isn't live. → `validateIssue` and `sendIssue` tests, Task 6.

---

## File Structure

```
db/newsletter.sql                         migration (two tables)
src/lib/newsletter/
  constants.ts      client-safe: POLICY_VERSION, EMAIL_MAX, copy strings
  email.ts          normalizeEmail, SubscribeSchema (zod)            (tested)
  token.ts          signConfirmToken / verifyConfirmToken, hashIp     (tested)
  subscribe.ts      planSubscribe (pure decision), handleSubscribe, handleConfirm (deps injected)  (tested)
  db.ts             server-only Neon queries
  resend.ts         server-only Resend calls (contact → segment, send email, broadcast)
  emails.ts         renderConfirmEmail, renderIssueEmail (pure)       (tested)
  issue.ts          IssueSchema, validateIssue (pure)                 (tested)
  send.ts           sendIssue orchestration (deps injected)           (tested)
app/api/newsletter/subscribe/route.ts
app/api/newsletter/confirm/route.ts
app/blog/suscripcion/page.tsx             result page (?estado=…)
app/privacidad/page.tsx                   privacy policy (Spanish)
app/components/blog/newsletter-signup.tsx client form
newsletter/issues/                        NNNN.json issue files (Plan 3 writes them)
scripts/newsletter/send.ts                CLI
.github/workflows/newsletter-send.yml
docs/newsletter-setup.md                  one-time setup checklist for Sebastián
```

---

### Task 1: Email normalization, schema and signed tokens

**Files:** Create `src/lib/newsletter/{constants.ts,email.ts,email.test.ts,token.ts,token.test.ts}`

**Interfaces:**
- Produces:
  - `POLICY_VERSION = "2026-11-14"`, `CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000`, `RESEND_COOLDOWN_MS = 10 * 60 * 1000` (constants.ts, no server imports).
  - `normalizeEmail(raw: string): string` trims and lowercases the whole address.
  - `SubscribeSchema` (zod): `{ email: string (trimmed, ≤254, EMAIL_RE from src/lib/contact.ts, transformed by normalizeEmail), consent: z.literal(true), source: string (regex ^[a-z0-9-]{1,80}$, default "blog"), company?: string }`. `type SubscribeInput`.
  - `signConfirmToken(email: string, issuedAt: number, secret: string): string` → `base64url(email) + "." + issuedAt + "." + hmac`.
  - `verifyConfirmToken(token: string, now: number, secret: string): { ok: true; email: string } | { ok: false; reason: "invalid" | "expired" }`, using a timing-safe compare.
  - `hashIp(ip: string, secret: string): string` → hex HMAC-SHA256 of `"ip:" + ip`.

- [ ] **Step 1: Failing tests**

```ts
// email.test.ts
test("normalizes case and whitespace", () => expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com"));
test("schema normalizes and requires consent true", () => {
  expect(SubscribeSchema.parse({ email: " Ana@Example.com", consent: true }).email).toBe("ana@example.com");
  expect(SubscribeSchema.safeParse({ email: "ana@example.com", consent: false }).success).toBe(false);
  expect(SubscribeSchema.safeParse({ email: "ana@example.com" }).success).toBe(false);
});
test("rejects bad email and bad source", () => {
  expect(SubscribeSchema.safeParse({ email: "ana@", consent: true }).success).toBe(false);
  expect(SubscribeSchema.safeParse({ email: "a@b.co", consent: true, source: "Bad Source" }).success).toBe(false);
});
test("source defaults to blog", () => expect(SubscribeSchema.parse({ email: "a@b.co", consent: true }).source).toBe("blog"));

// token.test.ts
const S = "x".repeat(32); const T0 = 1_800_000_000_000;
test("round-trips", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0, S), T0 + 1000, S)).toEqual({ ok: true, email: "a@b.co" }));
test("expires after 7 days", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0, S), T0 + CONFIRM_TTL_MS + 1, S)).toEqual({ ok: false, reason: "expired" }));
test("tampered email is invalid", () => {
  const [, ts, mac] = signConfirmToken("a@b.co", T0, S).split(".");
  expect(verifyConfirmToken(`${Buffer.from("x@b.co").toString("base64url")}.${ts}.${mac}`, T0, S).ok).toBe(false);
});
test.each(["", "abc", "a.b", "a.b.c.d"])("garbage %s is invalid", (t) => expect(verifyConfirmToken(t, T0, S)).toEqual({ ok: false, reason: "invalid" }));
test("wrong secret is invalid", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0, S), T0, "y".repeat(32)).ok).toBe(false));
test("future issuedAt beyond 5 min is invalid", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0 + 600_000, S), T0, S).ok).toBe(false));
test("hashIp is stable and not the ip", () => { expect(hashIp("1.2.3.4", S)).toBe(hashIp("1.2.3.4", S)); expect(hashIp("1.2.3.4", S)).not.toContain("1.2.3.4"); });
```

- [ ] **Step 2: Run** `npm test` → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(newsletter): email normalization, sign-up schema and signed confirmation tokens`.

---

### Task 2: Database, Resend adapter and subscription logic

**Files:** Create `db/newsletter.sql`, `src/lib/newsletter/{db.ts,resend.ts,subscribe.ts,subscribe.test.ts}`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `db/newsletter.sql`:
    - Table `newsletter_subscribers`: `email text PRIMARY KEY`, `status text NOT NULL CHECK (status IN ('pending','confirmed','unsubscribed'))`, `source text NOT NULL`, `consent_at timestamptz NOT NULL`, `policy_version text NOT NULL`, `ip_hash text NOT NULL`, `last_link_at timestamptz NOT NULL`, `confirmed_at timestamptz`, `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()`.
    - Table `newsletter_sends`: `issue integer PRIMARY KEY`, `status text NOT NULL CHECK (status IN ('sending','sent'))`, `broadcast_id text`, `claimed_at timestamptz NOT NULL DEFAULT now()`, `sent_at timestamptz`.
    - All statements are idempotent (`IF NOT EXISTS`).
  - `type SubscriberStatus = "pending" | "confirmed" | "unsubscribed"`; `type SubscriberRow = { status: SubscriberStatus; lastLinkAt: number }`.
  - `planSubscribe(existing: SubscriberRow | null, now: number): "create" | "resend_link" | "noop" | "reconsent"`. The pure decision:
    - null → `create`
    - pending or confirmed, and lastLinkAt older than `RESEND_COOLDOWN_MS` → `resend_link`
    - pending or confirmed, inside the cooldown → `noop`
    - unsubscribed → `reconsent` (that status is set by hand when someone asks for deletion)
  - Why a confirmed address gets a link again: unsubscribes happen in Resend, so the DB can't tell whether a "confirmed" person later unsubscribed. Sending a link lets them rejoin; clicking it re-adds them to the segment. It also keeps the response identical for every state.
  - `type SubscribeDeps = { getSubscriber(email): Promise<SubscriberRow|null>; upsertPending(r: { email; source; ipHash; policyVersion; now: Date }): Promise<void>; touchLink(email, now: Date): Promise<void>; sendConfirmEmail(email: string, confirmUrl: string): Promise<void>; secret: string; siteUrl: string; now(): number }`.
  - `handleSubscribe(input: SubscribeInput, ip: string, deps: SubscribeDeps): Promise<void>`:
    - `create` / `reconsent` → `upsertPending` (status pending, fresh consent fields, last_link_at = now), then send the link.
    - `resend_link` → `touchLink`, then send the link.
    - `noop` → nothing.
    - Link: `${siteUrl}/api/newsletter/confirm?token=${encodeURIComponent(signConfirmToken(email, now, secret))}`.
  - `db.ts` (server-only), same style as `src/lib/mentoria/db.ts`: `getSubscriber`, `upsertPending` (INSERT … ON CONFLICT (email) DO UPDATE), `touchLink`, `markConfirmed(email, now): Promise<"confirmed" | "already" | "missing">`, `claimSend(issue): Promise<"claimed" | "sending" | "sent">` (INSERT … ON CONFLICT DO NOTHING RETURNING, else read the existing status), `markSent(issue, broadcastId)`.
  - `resend.ts` (server-only):
    - `newsletterFrom(): string` (default per Global Constraints).
    - `addToSegment(email): Promise<void>`: create the contact with `segments: [{ id: RESEND_NEWSLETTER_SEGMENT_ID }]`, with `unsubscribed: false`. If the contact exists, update it to be in the segment and not unsubscribed.
    - `sendEmail({ to, subject, html, text }): Promise<void>`: throws on Resend error.
    - `sendBroadcast({ name, subject, html, text }): Promise<string>`: creates and sends to the segment, and returns the broadcast id.
    - Read the installed SDK's `.d.mts` for exact call shapes; don't guess.

- [ ] **Step 1: Failing tests** (`subscribe.test.ts`, with in-memory fake deps recording calls):

```ts
const NOW = 1_800_000_000_000;
test.each([
  [null, "create"],
  [{ status: "pending", lastLinkAt: NOW - 11 * 60_000 }, "resend_link"],
  [{ status: "pending", lastLinkAt: NOW - 60_000 }, "noop"],
  [{ status: "confirmed", lastLinkAt: 0 }, "resend_link"],
  [{ status: "confirmed", lastLinkAt: NOW - 60_000 }, "noop"],
  [{ status: "unsubscribed", lastLinkAt: 0 }, "reconsent"],
])("planSubscribe(%o) = %s", (row, want) => expect(planSubscribe(row as never, NOW)).toBe(want));
test("new address: stores pending with consent evidence and emails a confirm link", async () => {
  const d = fakeDeps(); await handleSubscribe({ email: "a@b.co", consent: true, source: "blog" }, "1.2.3.4", d);
  expect(d.calls.upsertPending[0]).toMatchObject({ email: "a@b.co", source: "blog", policyVersion: POLICY_VERSION, ipHash: hashIp("1.2.3.4", d.secret) });
  expect(d.calls.sendConfirmEmail[0][1]).toMatch(/^https:\/\/example\.com\/api\/newsletter\/confirm\?token=/);
});
test("confirmed address: keeps status, only touches the link time and emails a link", async () => {
  const d = fakeDeps({ "a@b.co": { status: "confirmed", lastLinkAt: 0 } }); await handleSubscribe({ email: "a@b.co", consent: true, source: "blog" }, "ip", d);
  expect(d.calls.upsertPending).toHaveLength(0); expect(d.calls.touchLink).toHaveLength(1); expect(d.calls.sendConfirmEmail).toHaveLength(1);
});
test("pending inside cooldown: no email", async () => { /* lastLinkAt NOW-60s → no sendConfirmEmail */ });
test("raw IP never reaches storage", async () => { const d = fakeDeps(); await handleSubscribe({ email: "a@b.co", consent: true, source: "blog" }, "9.9.9.9", d); expect(JSON.stringify(d.calls)).not.toContain("9.9.9.9"); });
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `subscribe.ts`, then `db.ts`, `resend.ts` and the SQL. **Step 4: Run** → PASS. Also run `npm run build`.
- [ ] **Step 5: Commit** `feat(newsletter): subscriber storage, Resend adapter and sign-up decisions`.

---

### Task 3: Email templates

**Files:** Create `src/lib/newsletter/{emails.ts,emails.test.ts}`

**Interfaces:**
- Consumes: `IssuePost` (defined here and reused by Task 6): `{ slug: string; title: string; blurb: string; url: string; imageUrl: string }`.
- Produces:
  - `renderConfirmEmail(confirmUrl: string): { subject: string; html: string; text: string }`. Subject **"Confirma tu suscripción al boletín"**. The body says what they signed up for (a biweekly summary of AI research explained simply), has one button "Confirmar suscripción", notes that the link expires in 7 days, and says "Si no fuiste tú, ignora este correo".
  - `renderIssueEmail(issue: { issue: number; subject: string; preheader: string; intro: string }, posts: IssuePost[], siteUrl: string): { subject; html; text }`:
    - A hidden preheader.
    - A header naming the issue ("Edición N").
    - The intro paragraphs.
    - One block per post: the image linked to the post, the title linked, the blurb, and "Leer la explicación →".
    - A footer with "Recibes esto porque te suscribiste en sebastiangomezahumada.com/blog", the `{{{RESEND_UNSUBSCRIBE_URL}}}` link "Darte de baja", and a `/privacidad` link.
  - Follow the visual and inline-style approach of `src/lib/confirmation-email.ts` (600px table, brand colors, Manrope stack). Escape every interpolated string.

- [ ] **Step 1: Failing tests**

```ts
test("confirm email links the URL and states expiry", () => { const e = renderConfirmEmail("https://x.co/api/newsletter/confirm?token=a.b.c");
  expect(e.subject).toBe("Confirma tu suscripción al boletín"); expect(e.html).toContain('href="https://x.co/api/newsletter/confirm?token=a.b.c"'); expect(e.text).toContain("7 días"); });
test("issue email has every post link, unsubscribe placeholder and privacy link", () => { const e = renderIssueEmail(issue, [post("a"), post("b")], "https://x.co");
  expect(e.html).toContain("https://x.co/blog/a"); expect(e.html).toContain("https://x.co/blog/b"); expect(e.html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  expect(e.html).toContain("https://x.co/privacidad"); expect(e.text).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}"); expect(e.subject).toBe(issue.subject); });
test("escapes HTML in titles and blurbs", () => expect(renderIssueEmail(issue, [{ ...post("a"), title: '<script>"x"</script>' }], "https://x.co").html).not.toContain("<script>"));
test("tangerine is never a text color", () => expect(renderIssueEmail(issue, [post("a")], "https://x.co").html).not.toMatch(/(?<!background-)color:\s*#F07A2E/i));
```

- [ ] **Step 2–4:** RED → implement → GREEN. **Step 5: Commit** `feat(newsletter): confirmation and issue email templates`.

---

### Task 4: API routes and result page

**Files:** Create `app/api/newsletter/subscribe/route.ts`, `app/api/newsletter/confirm/route.ts`, `src/lib/newsletter/confirm.ts`, `src/lib/newsletter/confirm.test.ts`, `app/blog/suscripcion/page.tsx`; Modify `src/lib/contact.ts` only if the rate limiter is extracted (see Step 3)

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces:
  - `POST /api/newsletter/subscribe`, JSON `{ email, consent, source?, company? }`:
    - A filled honeypot → `{ ok: true }`, nothing stored.
    - Invalid input → 400 `{ ok: false, error: "invalid" }`.
    - Over the rate limit → 429 `{ ok: false, error: "rate_limited" }`.
    - Missing env → 500 `{ ok: false, error: "server" }`.
    - Otherwise `handleSubscribe` → `{ ok: true }`.
    - Type `NewsletterResponse` lives in `constants.ts` (client-safe).
  - `handleConfirm(token: string, deps: { markConfirmed; addToSegment; secret; now() }): Promise<"confirmada" | "ya-confirmada" | "expirada" | "invalida" | "error">`:
    - Verify the token.
    - `markConfirmed` → `"confirmed"`: `addToSegment`, then `"confirmada"`. `"already"`: `"ya-confirmada"` (still call `addToSegment`, which is idempotent, to heal a past failure). `"missing"`: `"invalida"`.
    - If `addToSegment` throws → `"error"`, and the DB stays confirmed so a retry of the link heals it.
  - `GET /api/newsletter/confirm?token=…` → 303 redirect to `/blog/suscripcion?estado=<result>`. Response header `Referrer-Policy: no-referrer`.
  - `/blog/suscripcion` (noindex) renders Spanish copy per `estado`, with a link back to `/blog`. Unknown `estado` → the generic "Revisa tu correo" state, which the form also links to after submit.
    - `confirmada`: "¡Listo! Ya estás suscrito."
    - `ya-confirmada`: "Tu suscripción está activa." (it also covers someone rejoining after unsubscribing)
    - `expirada`: "El enlace venció. Suscríbete de nuevo para recibir uno nuevo."
    - `invalida` and `error`: an apology plus an invitation to try again.

- [ ] **Step 1: Failing tests** (`confirm.test.ts`) cover each branch of `handleConfirm`, including that an expired token never calls `markConfirmed`, and the "already" healing call.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Extract the contact route's in-memory limiter into `src/lib/rate-limit.ts` (`createRateLimiter({ windowMs, max }) => (key: string) => boolean`), use it in both routes, and add a test for it. Keep `/api/contact` behavior identical.
- [ ] **Step 4: Run** `npm test`, `npm run lint`, `npm run build` → pass. With `.env.local` pointing at a Neon dev branch and `NEWSLETTER_FROM_EMAIL=onboarding@resend.dev`, `curl` the subscribe endpoint with your own address, click the link, and see `/blog/suscripcion?estado=confirmada`. If env isn't available to the implementer, say so in the report; the controller verifies.
- [ ] **Step 5: Commit** `feat(newsletter): subscribe and confirm endpoints with result page`.

---

### Task 5: Signup form and privacy policy

**Files:** Create `app/components/blog/newsletter-signup.tsx`, `app/privacidad/page.tsx`; Modify `app/blog/page.tsx`, `app/components/blog/post-shell.tsx`, `app/sitemap.ts`

**Interfaces:**
- Consumes: `NewsletterResponse`, `POLICY_VERSION`.
- Produces:
  - `<NewsletterSignup source: string />` (client):
    - Heading "Recibe la próxima edición" and one line "Un resumen cada dos semanas con 3–4 ideas recientes de IA, explicadas en simple."
    - An email input with a visible label.
    - A required consent checkbox: "Acepto la [política de tratamiento de datos](/privacidad) y recibir el boletín por correo."
    - A hidden honeypot `company`, and a submit button "Suscribirme".
    - States: idle, sending (button disabled), ok ("Revisa tu correo: te enviamos un enlace para confirmar."), invalid, rate_limited and server, each with a Spanish message in an `aria-live="polite"` region.
    - Accessibility as on the blog: visible focus, `text-graphite` for small text, ≥4.5:1, labels tied to inputs.
  - Placement: on `/blog` below the intro (`source="blog"`), and in `PostShell` after the children and the Fuente box (`source={slug}`).
  - `/privacidad`: Spanish policy, indexable, in the sitemap. Sections:
    - Responsable: Sebastián Gómez Ahumada, Bogotá, Colombia, contacto `contact@sebastiangomezahumada.com`.
    - Qué datos: solo el correo; además fecha del consentimiento y un hash irreversible de la IP como evidencia.
    - Para qué: enviar el boletín.
    - Base legal: consentimiento previo, expreso e informado (Ley 1581 de 2012 y Decreto 1377 de 2013).
    - Encargados: Resend (envío) y Neon (almacenamiento), con servidores fuera de Colombia.
    - Derechos (conocer, actualizar, rectificar, suprimir, revocar), and how to exercise them: escribir al correo, o "Darte de baja" en cada envío.
    - Conservación: mientras estés suscrito; se elimina a solicitud.
    - Versión y fecha: `POLICY_VERSION`.
    - A top note: "Borrador: pendiente de revisión por Sebastián antes del lanzamiento" when not production (`deploymentEnv()`), absent in production.

- [ ] **Step 1: Implement** the component, placement and page. Lint and build.
- [ ] **Step 2: Verify with Playwright** on `npm run dev`:
  - The form submits to a stubbed route (intercept `**/api/newsletter/subscribe` → `{ok:true}`) and shows the success message.
  - Unticked consent blocks submit natively.
  - Keyboard: Tab order, focus visible, and the message is announced.
  - 375px: no horizontal scroll. Both themes.
- [ ] **Step 3: Run** `npm test`, `npm run lint`, `npm run build`, `npm run blog:check` → pass.
- [ ] **Step 4: Commit** `feat(newsletter): signup form on the blog and privacy policy page`.

---

### Task 6: Issue files and the send script

**Files:** Create `src/lib/newsletter/{issue.ts,issue.test.ts,send.ts,send.test.ts}`, `scripts/newsletter/send.ts`, `newsletter/issues/.gitkeep`; Modify `package.json` (script `"newsletter:send": "tsx scripts/newsletter/send.ts"`)

**Interfaces:**
- Consumes: `renderIssueEmail`, `IssuePost` (Task 3), `claimSend`/`markSent` (Task 2), `sendBroadcast`/`sendEmail` (Task 2), Plan 1's `readPostEntries` (`src/lib/blog/entries.ts`) and `PostMetaSchema`.
- Produces:
  - Issue file `newsletter/issues/NNNN.json` (4-digit, zero-padded, equal to `issue`):
    ```json
    { "issue": 1, "date": "2026-12-01", "subject": "…", "preheader": "…", "intro": "…", "posts": [ { "slug": "…", "blurb": "…" } ] }
    ```
    `IssueSchema`:
    - `issue` int ≥1
    - `date` YYYY-MM-DD
    - `subject` 1–90 chars
    - `preheader` ≤140
    - `intro` 1–800 (paragraphs separated by a blank line)
    - `posts` 1–4 items, each `{ slug, blurb (1–320) }`
  - `validateIssue(issue: unknown, fileName: string, posts: Map<string, PostMeta>): { ok: true; issue: Issue } | { ok: false; errors: string[] }`. Errors:
    - schema error
    - filename ≠ number
    - an unknown slug
    - a draft post
    - a duplicate slug
  - `type SendDeps = { claimSend(issue): Promise<"claimed"|"sending"|"sent">; markSent(issue, id): Promise<void>; isLive(url: string): Promise<boolean>; sleep(ms): Promise<void>; sendBroadcast(e: { name; subject; html; text }): Promise<string>; log(msg: string): void }`.
  - `sendIssue(issue: Issue, posts: IssuePost[], opts: { siteUrl: string; waitMs: number; pollMs: number }, deps: SendDeps): Promise<"sent" | "already-sent" | "stuck" | "not-live">`. Order:
    1. Poll `isLive(post.url)` for every post until all are true or `waitMs` has passed. If not all are live → `"not-live"`, logging the missing slugs, with **no claim**.
    2. `claimSend`. `"sent"` → `"already-sent"`. `"sending"` → `"stuck"`, logging "A previous run claimed issue N but didn't confirm sending. Check the Resend dashboard, then mark it in newsletter_sends." `"claimed"` → continue.
    3. `sendBroadcast` (name `Edición N`).
    4. `markSent`.
  - CLI `npm run newsletter:send -- --issue N [--dry-run] [--test-to you@x.co] [--wait-min 15]`:
    - Loads and validates the file and the posts. Builds `IssuePost.url = ${site.url}/blog/<slug>` and `imageUrl = ${site.url}/blog/og/<slug>`.
    - `--dry-run`: writes `.newsletter-preview/NNNN.html` (gitignored) and prints the summary. No network.
    - `--test-to`: sends one normal email with `sendEmail` (subject prefixed "[Prueba] "), with no claim and no live check.
    - Otherwise runs `sendIssue`.
    - Exit code 0 on `sent`/`already-sent`, 1 otherwise.

- [ ] **Step 1: Failing tests**

```ts
// issue.test.ts — posts map has "a" (published) and "d" (draft)
test("valid issue passes", () => expect(validateIssue(issue({ posts: [{ slug: "a", blurb: "x" }] }), "0001.json", posts).ok).toBe(true));
test("file name must match number", () => expect(validateIssue(issue({ issue: 2 }), "0001.json", posts).ok).toBe(false));
test("unknown slug fails", () => expect(errs(issue({ posts: [{ slug: "zzz", blurb: "x" }] }))).toContainEqual(expect.stringContaining("zzz")));
test("draft post fails", () => expect(errs(issue({ posts: [{ slug: "d", blurb: "x" }] }))).toContainEqual(expect.stringContaining("d")));
test("more than 4 posts fails", () => expect(validateIssue(issue({ posts: Array(5).fill({ slug: "a", blurb: "x" }) }), "0001.json", posts).ok).toBe(false));

// send.test.ts — fake deps with a clock; waitMs 1000, pollMs 100
test("sends once when all posts are live", async () => { const d = deps(); expect(await sendIssue(I, P, O, d)).toBe("sent"); expect(d.broadcasts).toHaveLength(1); expect(d.marked).toEqual([[1, "b_1"]]); });
test("already sent: no broadcast", async () => { const d = deps({ claim: "sent" }); expect(await sendIssue(I, P, O, d)).toBe("already-sent"); expect(d.broadcasts).toHaveLength(0); });
test("stuck claim: no broadcast", async () => { const d = deps({ claim: "sending" }); expect(await sendIssue(I, P, O, d)).toBe("stuck"); expect(d.broadcasts).toHaveLength(0); });
test("post never live: no claim, no broadcast", async () => { const d = deps({ live: () => false }); expect(await sendIssue(I, P, O, d)).toBe("not-live"); expect(d.claims).toHaveLength(0); expect(d.logs.join()).toContain(P[0].slug); });
test("post becomes live after polling", async () => { let n = 0; const d = deps({ live: () => ++n > 3 }); expect(await sendIssue(I, P, O, d)).toBe("sent"); });
test("broadcast failure leaves the claim (no retry)", async () => { const d = deps({ broadcastThrows: true }); await expect(sendIssue(I, P, O, d)).rejects.toThrow(); expect(d.marked).toHaveLength(0); });
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `issue.ts`, `send.ts` and the CLI (`isLive` = `fetch(url, { redirect: "manual" })` status 200; add `.newsletter-preview/` to `.gitignore`). **Step 4: Run** → PASS. Create a throwaway `newsletter/issues/0001.json` using `mezcla-de-expertos`, run `--dry-run` (expect a validation error because the post is a draft), temporarily point it at a fake published post map in a test, then delete the throwaway. Open a preview HTML generated in a unit-level script, look at it in Playwright at 600px, and describe it in the report.
- [ ] **Step 5: Commit** `feat(newsletter): issue file format, validation and send-once script`.

---

### Task 7: Send workflow, setup checklist and docs

**Files:** Create `.github/workflows/newsletter-send.yml`, `docs/newsletter-setup.md`; Modify `CLAUDE.md`

**Interfaces:**
- Consumes: the `newsletter:send` CLI.
- Produces:
  - Workflow `newsletter-send.yml`:
    - Triggers: `push` to `master` with `paths: ["newsletter/issues/*.json"]`, and `workflow_dispatch` with inputs `issue` (required), `dry_run` (boolean, default true) and `test_to` (optional).
    - On push it finds the issue files *added* in the push (`git diff --diff-filter=A --name-only ${{ github.event.before }} ${{ github.sha }} -- newsletter/issues/`) and sends each one in ascending order. Modified files never trigger a send.
    - `concurrency: newsletter-send` with `cancel-in-progress: false`.
    - Node 22, `npm ci`, and `--wait-min 15`.
    - Secrets: `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, `NEWSLETTER_FROM_EMAIL`.
    - `permissions: contents: read`. No Claude here.
  - `docs/newsletter-setup.md`, a checklist in English for Sebastián, in order:
    1. Verify `news.sebastiangomezahumada.com` in Resend (DNS records; where to add them).
    2. Create the segment "Boletín" and copy its id.
    3. Run `db/newsletter.sql` on the Neon `personal-portfolio` project (main branch).
    4. Generate `NEWSLETTER_SECRET` (`openssl rand -base64 48`).
    5. Set the env vars in Vercel (production and preview) and in `.env.local`.
    6. Add the GitHub secrets.
    7. Review the `/privacidad` text.
    8. Test: subscribe yourself, confirm, then `npm run newsletter:send -- --issue N --test-to you@…`.
    9. Note that the first real send happens when an issue file is merged.
  - `CLAUDE.md`:
    - Environment: the new vars.
    - Project layout: `src/lib/newsletter/`, the two API routes, `/privacidad`, `/blog/suscripcion`, `newsletter/issues/` (format and the "added file = send" rule), and `db/newsletter.sql`.
    - Commands: `newsletter:send`.

- [ ] **Step 1: Write** the workflow and docs. Validate the YAML with `npx --yes @action-validator/cli .github/workflows/newsletter-send.yml` if available; otherwise parse it with `node -e "require('yaml')"` or note it.
- [ ] **Step 2: Run** `npm test`, `npm run lint`, `npm run build` → pass.
- [ ] **Step 3: Commit** `docs(newsletter): send workflow and setup checklist`.

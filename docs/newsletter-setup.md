# Newsletter setup checklist

One-time setup for the Spanish double-opt-in newsletter. Do the steps in order.

> **The newsletter stays hidden until steps 1–6 are done.** The signup form on `/blog` and in posts only renders when `isNewsletterConfigured()` (`src/lib/newsletter/config.ts`) finds `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, `DATABASE_URL` and a `NEWSLETTER_SECRET` of at least 32 characters. Until then `/privacidad` is also `noindex` and left out of `/sitemap.xml`. The blog pages are static, so this is checked at build time: after you set the env in Vercel, **redeploy** to turn the newsletter on.

1. **Verify the sending domain in Resend.** Resend dashboard > Domains > Add `news.sebastiangomezahumada.com`. Add the DNS records Resend shows (SPF, DKIM and the return-path MX) at the DNS provider that manages `sebastiangomezahumada.com`, then click Verify. Sender is `Sebastián Gómez <boletin@news.sebastiangomezahumada.com>`.
   - Turn **off open and click tracking** for this domain (Domains > the domain > Open/Click tracking). The privacy policy does not mention tracking. If you want tracking, update `/privacidad` first.
2. **Create the segment.** Resend > Audience > Segments > create "Boletín" and copy its id. It becomes `RESEND_NEWSLETTER_SEGMENT_ID`.
3. **Create the tables.** Run `db/newsletter.sql` on the Neon `personal-portfolio` project (main branch), for example in the Neon SQL editor.
4. **Generate the secret.** `openssl rand -base64 48` gives `NEWSLETTER_SECRET` (at least 32 characters; signs confirmation tokens and hashes IPs).
5. **Set the env vars** in Vercel (Production and Preview) and in `.env.local`:
   - `DATABASE_URL`
   - `RESEND_API_KEY`
   - `RESEND_NEWSLETTER_SEGMENT_ID`
   - `NEWSLETTER_SECRET`
   - `NEWSLETTER_FROM_EMAIL` (optional, overrides the sender)

   Preview deployments use the same `DATABASE_URL` as production, so a signup on a preview writes to the production table. To keep previews separate, set a Neon branch connection string for the Preview environment only.
6. **Add the GitHub secrets** (repo Settings > Secrets and variables > Actions): `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, and optionally `NEWSLETTER_FROM_EMAIL` (leave it out to use the default sender). Use the same values as Vercel.

   Then **redeploy production** in Vercel so the build picks up the env and the signup form appears.
7. **Review `/privacidad`.** Read the text and check the commitments you personally have to keep:
   - replies to data requests within 10 business days (queries) and 15 business days (claims);
   - emailing subscribers before the policy changes;
   - Decreto 1377 details, such as a contact address or phone, if your lawyer advises adding them.
8. **Confirm the accounts are personal.** The Claude, Resend and Neon accounts used for this must be yours, not a work account.
9. **Test end to end on production** (after the redeploy in step 6; confirmation links always point at `site.url`, the production domain).
   1. Subscribe yourself with the form on `/blog` (or at the end of any post) and click the confirmation link. You should land on `/blog/suscripcion?estado=confirmada`.
   2. Click the same link again: it should show the "ya confirmada" page (`estado=ya-confirmada`) and change nothing.
   3. Create the issue file first: `--dry-run` and `--test-to` both read `newsletter/issues/NNNN.json`, so it must exist locally (it is only sent when merged to `master`).
   4. Preview: `npm run newsletter:send -- --issue N --dry-run` (writes `.newsletter-preview/NNNN.html`, sends nothing).
   5. Send yourself one email: `npm run newsletter:send -- --issue N --test-to you@example.com` (subject prefixed `[Prueba]`, no claim, the issue can still be broadcast).
10. **First real send.** Merging a *new* file `newsletter/issues/NNNN.json` to `master` triggers the `Newsletter send` workflow, which waits up to 15 minutes for the posts to be live and then broadcasts to the segment. Edits to existing issue files never send. You can also run the workflow manually (Actions > Newsletter send; dry run is on by default). A manual real send (dry run off, no `test_to`) only works on `master`; dry runs and test sends work from any branch.
    - **Two pushes that add issues while a send is running:** runs are queued one at a time, and GitHub keeps only the newest pending run, so an issue added by a push whose run got replaced may never be sent. Check the Actions tab, and if an issue is missing, send it with a manual run (dry run off) on `master`.

## How consent and unsubscribes work

- The confirmation link is signed and carries the sign-up's consent evidence (time, policy version, source page, IP hash). Neon only records that evidence when the link is confirmed.
- A link newer than the last confirmation counts as fresh consent: it refreshes the evidence and re-subscribes the contact in Resend. An older link (already used, or from before a later confirmation) changes nothing, so it can never undo an unsubscribe.
- Unsubscribing happens in Resend (the "Darte de baja" link). Resend keeps the address marked as unsubscribed; Neon keeps the record of the last confirmed authorization. Full deletion is done by hand on request, in both.

## Automating the content

To have an agent propose candidates and draft posts for you, follow `docs/newsletter-automation-setup.md` once this guide is done.

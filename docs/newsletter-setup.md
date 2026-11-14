# Newsletter setup checklist

One-time setup for the Spanish double-opt-in newsletter. Do the steps in order.

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
6. **Add the GitHub secrets** (repo Settings > Secrets and variables > Actions): `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, `NEWSLETTER_FROM_EMAIL`. Use the same values as Vercel.
7. **Review `/privacidad`.** Read the text and check the commitments you personally have to keep:
   - replies to data requests within 10 business days (queries) and 15 business days (claims);
   - emailing subscribers before the policy changes;
   - Decreto 1377 details, such as a contact address or phone, if your lawyer advises adding them.
8. **Confirm the accounts are personal.** The Claude, Resend and Neon accounts used for this must be yours, not a work account.
9. **Test end to end.**
   1. Subscribe yourself at `/blog/suscripcion` and click the confirmation link.
   2. Preview: `npm run newsletter:send -- --issue N --dry-run` (writes `.newsletter-preview/NNNN.html`, sends nothing).
   3. Send yourself one email: `npm run newsletter:send -- --issue N --test-to you@example.com` (subject prefixed `[Prueba]`, no claim, the issue can still be broadcast).
10. **First real send.** Merging a *new* file `newsletter/issues/NNNN.json` to `master` triggers the `Newsletter send` workflow, which waits up to 15 minutes for the posts to be live and then broadcasts to the segment. Edits to existing issue files never send. You can also run the workflow manually (Actions > Newsletter send; dry run is on by default).

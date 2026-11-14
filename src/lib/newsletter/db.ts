import "server-only";
import { neon } from "@neondatabase/serverless";
import { decideConfirm, type ConfirmOutcome, type ConsentEvidence } from "@/lib/newsletter/confirm";
import type { SubscriberRow, SubscriberStatus } from "@/lib/newsletter/subscribe";

// Tables are defined in db/newsletter.sql (Neon project "personal-portfolio").

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function getSubscriber(email: string): Promise<SubscriberRow | null> {
  const rows = (await db()`
    SELECT status, last_link_at FROM newsletter_subscribers WHERE email = ${email}
  `) as { status: SubscriberStatus; last_link_at: string | Date }[];
  const r = rows[0];
  if (!r) return null;
  return { status: r.status, lastLinkAt: new Date(r.last_link_at).getTime() };
}

// Creates the pending row, or turns an unsubscribed row back into a pending one. Never touches a
// confirmed row (a confirm may land between the read and this write). last_link_at starts at the
// epoch and is only stamped by touchLink once the confirmation email has been sent.
export async function upsertPending(r: {
  email: string;
  source: string;
  ipHash: string;
  policyVersion: string;
  consentAt: Date;
}): Promise<void> {
  const at = r.consentAt.toISOString();
  await db()`
    INSERT INTO newsletter_subscribers
      (email, status, source, consent_at, policy_version, ip_hash, last_link_at, confirmed_at)
    VALUES (${r.email}, 'pending', ${r.source}, ${at}, ${r.policyVersion}, ${r.ipHash}, to_timestamp(0), NULL)
    ON CONFLICT (email) DO UPDATE SET
      status = 'pending',
      source = EXCLUDED.source,
      consent_at = EXCLUDED.consent_at,
      policy_version = EXCLUDED.policy_version,
      ip_hash = EXCLUDED.ip_hash,
      confirmed_at = NULL,
      updated_at = now()
    WHERE newsletter_subscribers.status <> 'confirmed'
  `;
}

export async function touchLink(email: string, now: Date): Promise<void> {
  await db()`
    UPDATE newsletter_subscribers
    SET last_link_at = ${now.toISOString()}, updated_at = now()
    WHERE email = ${email}
  `;
}

/**
 * Applies a valid confirmation link. The decision is decideConfirm (pure, tested); the UPDATEs repeat
 * its condition in their WHERE so a concurrent change is never overwritten. If one loses that race the
 * row is read again and decided afresh.
 */
export async function markConfirmed(
  email: string,
  ev: ConsentEvidence,
  now: Date,
): Promise<ConfirmOutcome> {
  const sql = db();
  const at = now.toISOString();
  const issued = new Date(ev.issuedAt).toISOString();
  for (let attempt = 0; attempt < 3; attempt++) {
    const rows = (await sql`
      SELECT status, confirmed_at FROM newsletter_subscribers WHERE email = ${email}
    `) as { status: SubscriberStatus; confirmed_at: string | Date | null }[];
    const r = rows[0];
    const outcome = decideConfirm(
      r ? { status: r.status, confirmedAt: r.confirmed_at === null ? null : new Date(r.confirmed_at).getTime() } : null,
      ev.issuedAt,
    );
    if (outcome === "missing" || outcome === "already") return outcome;

    // Each WHERE re-checks the state decideConfirm saw.
    const updated = (outcome === "confirmed"
      ? await sql`
          UPDATE newsletter_subscribers
          SET status = 'confirmed', confirmed_at = ${at}, consent_at = ${issued},
              policy_version = ${ev.policyVersion}, source = ${ev.source}, ip_hash = ${ev.ipHash},
              updated_at = now()
          WHERE email = ${email} AND status = 'pending'
          RETURNING email
        `
      : await sql`
          UPDATE newsletter_subscribers
          SET confirmed_at = ${at}, consent_at = ${issued},
              policy_version = ${ev.policyVersion}, source = ${ev.source}, ip_hash = ${ev.ipHash},
              updated_at = now()
          WHERE email = ${email} AND status = 'confirmed'
            AND (confirmed_at IS NULL OR confirmed_at < ${issued})
          RETURNING email
        `) as unknown[];
    if (updated.length > 0) return outcome;
  }
  throw new Error("markConfirmed: row kept changing");
}

export async function claimSend(issue: number): Promise<"claimed" | "sending" | "sent"> {
  const sql = db();
  const inserted = (await sql`
    INSERT INTO newsletter_sends (issue, status) VALUES (${issue}, 'sending')
    ON CONFLICT (issue) DO NOTHING
    RETURNING issue
  `) as unknown[];
  if (inserted.length > 0) return "claimed";
  const rows = (await sql`
    SELECT status FROM newsletter_sends WHERE issue = ${issue}
  `) as { status: "sending" | "sent" }[];
  return rows[0]?.status === "sent" ? "sent" : "sending";
}

export async function markSent(issue: number, broadcastId: string): Promise<void> {
  await db()`
    UPDATE newsletter_sends
    SET status = 'sent', broadcast_id = ${broadcastId}, sent_at = now()
    WHERE issue = ${issue}
  `;
}

import "server-only";
import { neon } from "@neondatabase/serverless";
import type { SubscriberRow, SubscriberStatus } from "./subscribe";

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

export async function upsertPending(r: {
  email: string;
  source: string;
  ipHash: string;
  policyVersion: string;
  now: Date;
}): Promise<void> {
  const at = r.now.toISOString();
  await db()`
    INSERT INTO newsletter_subscribers
      (email, status, source, consent_at, policy_version, ip_hash, last_link_at, confirmed_at)
    VALUES (${r.email}, 'pending', ${r.source}, ${at}, ${r.policyVersion}, ${r.ipHash}, ${at}, NULL)
    ON CONFLICT (email) DO UPDATE SET
      status = 'pending',
      source = EXCLUDED.source,
      consent_at = EXCLUDED.consent_at,
      policy_version = EXCLUDED.policy_version,
      ip_hash = EXCLUDED.ip_hash,
      last_link_at = EXCLUDED.last_link_at,
      confirmed_at = NULL,
      updated_at = now()
  `;
}

export async function touchLink(email: string, now: Date): Promise<void> {
  await db()`
    UPDATE newsletter_subscribers
    SET last_link_at = ${now.toISOString()}, updated_at = now()
    WHERE email = ${email}
  `;
}

export async function markConfirmed(
  email: string,
  now: Date,
): Promise<"confirmed" | "already" | "missing"> {
  const sql = db();
  const updated = (await sql`
    UPDATE newsletter_subscribers
    SET status = 'confirmed', confirmed_at = ${now.toISOString()}, updated_at = now()
    WHERE email = ${email} AND status = 'pending'
    RETURNING email
  `) as unknown[];
  if (updated.length > 0) return "confirmed";
  const rows = (await sql`
    SELECT status FROM newsletter_subscribers WHERE email = ${email}
  `) as { status: SubscriberStatus }[];
  if (!rows[0]) return "missing";
  // Already confirmed: the caller still re-adds to the segment so a Resend
  // unsubscriber can rejoin. An unsubscribed row (set by hand) stays out.
  return rows[0].status === "confirmed" ? "already" : "missing";
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

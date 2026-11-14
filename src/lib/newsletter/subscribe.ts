import { RESEND_COOLDOWN_MS, POLICY_VERSION } from "./constants";
import type { SubscribeInput } from "./email";
import { hashIp, signConfirmToken } from "./token";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";
export type SubscriberRow = { status: SubscriberStatus; lastLinkAt: number };

export type SubscribeDeps = {
  getSubscriber(email: string): Promise<SubscriberRow | null>;
  upsertPending(r: {
    email: string;
    source: string;
    ipHash: string;
    policyVersion: string;
    consentAt: Date;
  }): Promise<void>;
  /** Stamps last_link_at; called only after the confirmation email was sent. */
  touchLink(email: string, now: Date): Promise<void>;
  sendConfirmEmail(email: string, confirmUrl: string): Promise<void>;
  secret: string;
  siteUrl: string;
  now(): number;
};

export function planSubscribe(
  existing: SubscriberRow | null,
  now: number,
): "create" | "resend_link" | "noop" | "reconsent" {
  if (!existing) return "create";
  if (existing.status === "unsubscribed") return "reconsent";
  return now - existing.lastLinkAt > RESEND_COOLDOWN_MS ? "resend_link" : "noop";
}

export async function handleSubscribe(
  input: SubscribeInput,
  ip: string,
  deps: SubscribeDeps,
): Promise<void> {
  const { email, source } = input;
  const now = deps.now();
  const plan = planSubscribe(await deps.getSubscriber(email), now);
  if (plan === "noop") return;

  const ipHash = hashIp(ip, deps.secret);
  // A new or unsubscribed address gets a pending row holding this request's evidence. A pending or
  // confirmed row is not written: the evidence travels in the signed link and reaches Neon only if
  // that link is confirmed.
  if (plan === "create" || plan === "reconsent") {
    await deps.upsertPending({
      email,
      source,
      ipHash,
      policyVersion: POLICY_VERSION,
      consentAt: new Date(now),
    });
  }

  const token = signConfirmToken(
    { email, issuedAt: now, policyVersion: POLICY_VERSION, source, ipHash },
    deps.secret,
  );
  await deps.sendConfirmEmail(
    email,
    `${deps.siteUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`,
  );
  // Only a link that actually went out starts the cooldown; a failed send can be retried at once.
  await deps.touchLink(email, new Date(now));
}

import type { SubscriberStatus } from "./subscribe";
import { verifyConfirmToken, type ConsentClaims } from "./token";

export type ConfirmResult = "confirmada" | "ya-confirmada" | "expirada" | "invalida" | "error";

/** What markConfirmed did with a valid link. */
export type ConfirmOutcome =
  /** pending → confirmed, evidence written (fresh consent). */
  | "confirmed"
  /** already confirmed, but this link is newer than that confirmation: evidence refreshed (fresh consent). */
  | "reconfirmed"
  /** already confirmed by this or a newer link: nothing written (stale link). */
  | "already"
  /** no row, or the row is unsubscribed in Neon. */
  | "missing";

/** The consent evidence a link carries, written to Neon on confirm. */
export type ConsentEvidence = Omit<ConsentClaims, "email">;

export type ConfirmRow = { status: SubscriberStatus; confirmedAt: number | null };

/**
 * Pure decision behind markConfirmed. Only a link issued after the last confirmation counts as
 * fresh consent, so an old link can never undo a later unsubscribe.
 */
export function decideConfirm(row: ConfirmRow | null, issuedAt: number): ConfirmOutcome {
  if (!row || row.status === "unsubscribed") return "missing";
  if (row.status === "pending") return "confirmed";
  return row.confirmedAt === null || issuedAt > row.confirmedAt ? "reconfirmed" : "already";
}

export type ConfirmDeps = {
  markConfirmed(email: string, evidence: ConsentEvidence, now: Date): Promise<ConfirmOutcome>;
  addToSegment(email: string, opts: { resubscribe: boolean }): Promise<void>;
  secret: string;
  now(): number;
};

export async function handleConfirm(token: unknown, deps: ConfirmDeps): Promise<ConfirmResult> {
  if (typeof token !== "string" || !token) return "invalida";
  const v = verifyConfirmToken(token, deps.now(), deps.secret);
  if (!v.ok) return v.reason === "expired" ? "expirada" : "invalida";

  try {
    const { email, issuedAt, policyVersion, source, ipHash } = v;
    const evidence: ConsentEvidence = { issuedAt, policyVersion, source, ipHash };
    const outcome = await deps.markConfirmed(email, evidence, new Date(deps.now()));
    if (outcome === "missing") return "invalida";
    const fresh = outcome !== "already";
    // A stale link still heals a past Resend failure (contact or segment missing), but it never
    // re-subscribes a contact that unsubscribed.
    await deps.addToSegment(email, { resubscribe: fresh });
    return fresh ? "confirmada" : "ya-confirmada";
  } catch (err) {
    console.error("[newsletter] confirm failed", err instanceof Error ? err.message : "unknown");
    return "error";
  }
}

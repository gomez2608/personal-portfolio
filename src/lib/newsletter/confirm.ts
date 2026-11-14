import type { markConfirmed as MarkConfirmed } from "./db";
import { verifyConfirmToken } from "./token";

export type ConfirmResult = "confirmada" | "ya-confirmada" | "expirada" | "invalida" | "error";

export type ConfirmDeps = {
  markConfirmed: typeof MarkConfirmed;
  addToSegment(email: string): Promise<void>;
  secret: string;
  now(): number;
};

export async function handleConfirm(token: unknown, deps: ConfirmDeps): Promise<ConfirmResult> {
  if (typeof token !== "string" || !token) return "invalida";
  const v = verifyConfirmToken(token, deps.now(), deps.secret);
  if (!v.ok) return v.reason === "expired" ? "expirada" : "invalida";

  try {
    const status = await deps.markConfirmed(v.email, new Date(deps.now()));
    if (status === "missing") return "invalida";
    // Also for "already": addToSegment is idempotent and heals a past failure.
    await deps.addToSegment(v.email);
    return status === "confirmed" ? "confirmada" : "ya-confirmada";
  } catch (err) {
    console.error("[newsletter] confirm failed", err instanceof Error ? err.message : "unknown");
    return "error";
  }
}

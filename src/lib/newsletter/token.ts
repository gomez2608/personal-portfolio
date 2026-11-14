import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { CONFIRM_TTL_MS } from "./constants";

const FUTURE_SKEW_MS = 5 * 60 * 1000;

/**
 * The consent evidence of one sign-up request. It travels inside the signed confirmation link and
 * is written to Neon only when that link is confirmed.
 */
export type ConsentClaims = {
  email: string;
  issuedAt: number;
  policyVersion: string;
  source: string;
  ipHash: string;
};

/** Wire format of the token body (short keys keep the link short). */
type Wire = { e: string; t: number; v: string; s: string; h: string };

function mac(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** `base64url(JSON claims) + "." + HMAC-SHA256(body)`. */
export function signConfirmToken(c: ConsentClaims, secret: string): string {
  const wire: Wire = { e: c.email, t: c.issuedAt, v: c.policyVersion, s: c.source, h: c.ipHash };
  const body = Buffer.from(JSON.stringify(wire)).toString("base64url");
  return `${body}.${mac(body, secret)}`;
}

export type VerifyResult =
  | ({ ok: true } & ConsentClaims)
  | { ok: false; reason: "invalid" | "expired" };

function parseWire(body: string): ConsentClaims | null {
  let w: unknown;
  try {
    w = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof w !== "object" || w === null || Array.isArray(w)) return null;
  const { e, t, v, s, h } = w as Partial<Record<keyof Wire, unknown>>;
  if (typeof e !== "string" || !e || e.length > 254) return null;
  if (typeof t !== "number" || !Number.isSafeInteger(t) || t < 0) return null;
  if (typeof v !== "string" || !v || v.length > 40) return null;
  if (typeof s !== "string" || !/^[a-z0-9-]{1,80}$/.test(s)) return null;
  if (typeof h !== "string" || !/^[0-9a-f]{64}$/.test(h)) return null;
  return { email: e, issuedAt: t, policyVersion: v, source: s, ipHash: h };
}

/** Never throws: anything malformed, tampered or signed with another secret is "invalid". */
export function verifyConfirmToken(token: string, now: number, secret: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };
  const [body, given] = parts;
  if (!body || !given) return { ok: false, reason: "invalid" };
  if (!safeEqual(given, mac(body, secret))) return { ok: false, reason: "invalid" };
  const claims = parseWire(body);
  if (!claims) return { ok: false, reason: "invalid" };
  if (claims.issuedAt - now > FUTURE_SKEW_MS) return { ok: false, reason: "invalid" };
  if (now - claims.issuedAt > CONFIRM_TTL_MS) return { ok: false, reason: "expired" };
  return { ok: true, ...claims };
}

export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(`ip:${ip}`).digest("hex");
}

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { CONFIRM_TTL_MS } from "./constants";

const FUTURE_SKEW_MS = 5 * 60 * 1000;

function mac(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function signConfirmToken(email: string, issuedAt: number, secret: string): string {
  const payload = `${Buffer.from(email).toString("base64url")}.${issuedAt}`;
  return `${payload}.${mac(payload, secret)}`;
}

export type VerifyResult = { ok: true; email: string } | { ok: false; reason: "invalid" | "expired" };

export function verifyConfirmToken(token: string, now: number, secret: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };
  const [b64, ts, given] = parts;
  if (!b64 || !/^\d{1,16}$/.test(ts) || !given) return { ok: false, reason: "invalid" };
  if (!safeEqual(given, mac(`${b64}.${ts}`, secret))) return { ok: false, reason: "invalid" };
  const issuedAt = Number(ts);
  if (issuedAt - now > FUTURE_SKEW_MS) return { ok: false, reason: "invalid" };
  if (now - issuedAt > CONFIRM_TTL_MS) return { ok: false, reason: "expired" };
  const email = Buffer.from(b64, "base64url").toString("utf8");
  if (!email) return { ok: false, reason: "invalid" };
  return { ok: true, email };
}

export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(`ip:${ip}`).digest("hex");
}

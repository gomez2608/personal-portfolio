import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { MentoriaPlan } from "@/app/data/mentoria/types";

// Access is checked on the server for every page render and every action, so
// nothing private is ever sent without a valid cookie. Not in middleware: that
// would be one more layer, not a replacement for these checks.

export type Role = "mentor" | "mentee";

const MENTEE_MAX_AGE = 60 * 60 * 24 * 120; // the whole mentorship
const MENTOR_MAX_AGE = 60 * 60 * 24 * 30;

const cookieName = (slug: string) => `mentoria_${slug}`;
export const cookiePath = (slug: string) => `/mentoria/${slug}`;

function secret() {
  const s = process.env.MENTORIA_SECRET;
  if (!s || s.length < 32) throw new Error("MENTORIA_SECRET is missing or too short");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Which role a submitted code grants for this plan, if any. */
export function roleForCode(plan: MentoriaPlan, code: string): Role | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  const mentor = process.env.MENTORIA_MENTOR_CODE?.trim().toUpperCase();
  const mentee = process.env[plan.codeEnv]?.trim().toUpperCase();
  if (mentor && safeEqual(c, mentor)) return "mentor";
  if (mentee && safeEqual(c, mentee)) return "mentee";
  return null;
}

export async function setSession(slug: string, role: Role) {
  const maxAge = role === "mentor" ? MENTOR_MAX_AGE : MENTEE_MAX_AGE;
  const exp = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `${slug}.${role}.${exp}`;
  (await cookies()).set(cookieName(slug), `${role}.${exp}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: cookiePath(slug),
    maxAge,
  });
}

export async function clearSession(slug: string) {
  (await cookies()).set(cookieName(slug), "", { path: cookiePath(slug), maxAge: 0 });
}

/** The role in the request's cookie, or null when missing, expired or tampered with. */
export async function getRole(slug: string): Promise<Role | null> {
  const raw = (await cookies()).get(cookieName(slug))?.value;
  if (!raw) return null;
  const [role, exp, sig] = raw.split(".");
  if ((role !== "mentor" && role !== "mentee") || !exp || !sig) return null;
  if (Number(exp) * 1000 < Date.now()) return null;
  if (!safeEqual(sig, sign(`${slug}.${role}.${exp}`))) return null;
  return role;
}

// Login attempts: 8 per IP and mentee per 15 minutes. In memory, like the contact
// form: resets on cold starts, which is fine for 8-hex-char codes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, number[]>();

export async function loginRateLimited(slug: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const key = `${slug}:${ip}`;
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 2000) {
    for (const [k, times] of attempts) if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
  }
  return recent.length > MAX_ATTEMPTS;
}

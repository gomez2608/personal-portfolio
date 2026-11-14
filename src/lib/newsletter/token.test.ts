import { expect, test } from "vitest";
import { CONFIRM_TTL_MS } from "./constants";
import { hashIp, signConfirmToken, verifyConfirmToken } from "./token";

const S = "x".repeat(32);
const T0 = 1_800_000_000_000;
test("round-trips", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0, S), T0 + 1000, S)).toEqual({ ok: true, email: "a@b.co" }));
test("expires after 7 days", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0, S), T0 + CONFIRM_TTL_MS + 1, S)).toEqual({ ok: false, reason: "expired" }));
test("tampered email is invalid", () => {
  const [, ts, mac] = signConfirmToken("a@b.co", T0, S).split(".");
  expect(verifyConfirmToken(`${Buffer.from("x@b.co").toString("base64url")}.${ts}.${mac}`, T0, S).ok).toBe(false);
});
test.each(["", "abc", "a.b", "a.b.c.d"])("garbage %s is invalid", (t) => expect(verifyConfirmToken(t, T0, S)).toEqual({ ok: false, reason: "invalid" }));
test("wrong secret is invalid", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0, S), T0, "y".repeat(32)).ok).toBe(false));
test("future issuedAt beyond 5 min is invalid", () => expect(verifyConfirmToken(signConfirmToken("a@b.co", T0 + 600_000, S), T0, S).ok).toBe(false));
test("hashIp is stable and not the ip", () => { expect(hashIp("1.2.3.4", S)).toBe(hashIp("1.2.3.4", S)); expect(hashIp("1.2.3.4", S)).not.toContain("1.2.3.4"); });

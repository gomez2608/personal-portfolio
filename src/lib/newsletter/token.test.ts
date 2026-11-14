import { createHmac } from "node:crypto";
import { expect, test } from "vitest";
import { CONFIRM_TTL_MS, POLICY_VERSION } from "./constants";
import { hashIp, signConfirmToken, verifyConfirmToken, type ConsentClaims } from "./token";

const S = "x".repeat(32);
const T0 = 1_800_000_000_000;
const claims = (over: Partial<ConsentClaims> = {}): ConsentClaims => ({
  email: "a@b.co",
  issuedAt: T0,
  policyVersion: POLICY_VERSION,
  source: "blog",
  ipHash: hashIp("1.2.3.4", S),
  ...over,
});

// Re-signs an arbitrary payload with the real secret, to test field validation behind a valid MAC.
const forge = (payload: unknown) => {
  const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
  const b64 = Buffer.from(raw).toString("base64url");
  return `${b64}.${createHmac("sha256", S).update(b64).digest("base64url")}`;
};

test("round-trips every consent field", () =>
  expect(verifyConfirmToken(signConfirmToken(claims(), S), T0 + 1000, S)).toEqual({ ok: true, ...claims() }));

test("expires after 7 days", () =>
  expect(verifyConfirmToken(signConfirmToken(claims(), S), T0 + CONFIRM_TTL_MS + 1, S)).toEqual({
    ok: false,
    reason: "expired",
  }));

test("still valid at exactly 7 days", () =>
  expect(verifyConfirmToken(signConfirmToken(claims(), S), T0 + CONFIRM_TTL_MS, S).ok).toBe(true));

test.each([
  ["email", { email: "x@b.co" }],
  ["issuedAt", { issuedAt: T0 + 1 }],
  ["policyVersion", { policyVersion: "2099-01-01" }],
  ["source", { source: "otro-post" }],
  ["ipHash", { ipHash: hashIp("5.6.7.8", S) }],
])("tampering with %s is invalid", (_field, over) => {
  const [, mac] = signConfirmToken(claims(), S).split(".");
  const [body] = signConfirmToken(claims(over), S).split(".");
  expect(verifyConfirmToken(`${body}.${mac}`, T0, S)).toEqual({ ok: false, reason: "invalid" });
});

test.each(["", "abc", "a.b", "a.b.c", "a.b.c.d", ".", "%%%.%%%"])("garbage %j is invalid", (t) =>
  expect(verifyConfirmToken(t, T0, S)).toEqual({ ok: false, reason: "invalid" }));

test.each([
  ["not JSON", "nope"],
  ["an array", [1, 2]],
  ["null", null],
  ["a missing field", { e: "a@b.co", t: T0, v: POLICY_VERSION, s: "blog" }],
  ["an empty email", { e: "", t: T0, v: POLICY_VERSION, s: "blog", h: hashIp("1", S) }],
  ["a string timestamp", { e: "a@b.co", t: String(T0), v: POLICY_VERSION, s: "blog", h: hashIp("1", S) }],
  ["a bad source", { e: "a@b.co", t: T0, v: POLICY_VERSION, s: "Bad Source", h: hashIp("1", S) }],
  ["a bad ip hash", { e: "a@b.co", t: T0, v: POLICY_VERSION, s: "blog", h: "1.2.3.4" }],
])("a correctly signed payload with %s is invalid and never throws", (_name, payload) => {
  expect(verifyConfirmToken(forge(payload), T0, S)).toEqual({ ok: false, reason: "invalid" });
});

test("wrong secret is invalid", () =>
  expect(verifyConfirmToken(signConfirmToken(claims(), S), T0, "y".repeat(32)).ok).toBe(false));

test("future issuedAt beyond 5 min is invalid, within 5 min is fine", () => {
  expect(verifyConfirmToken(signConfirmToken(claims({ issuedAt: T0 + 600_000 }), S), T0, S).ok).toBe(false);
  expect(verifyConfirmToken(signConfirmToken(claims({ issuedAt: T0 + 60_000 }), S), T0, S).ok).toBe(true);
});

test("token never contains the raw IP", () =>
  expect(Buffer.from(signConfirmToken(claims(), S).split(".")[0], "base64url").toString()).not.toContain("1.2.3.4"));

test("hashIp is stable and not the ip", () => {
  expect(hashIp("1.2.3.4", S)).toBe(hashIp("1.2.3.4", S));
  expect(hashIp("1.2.3.4", S)).not.toContain("1.2.3.4");
});

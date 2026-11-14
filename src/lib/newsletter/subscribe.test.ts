import { expect, test } from "vitest";
import { POLICY_VERSION } from "./constants";
import { handleSubscribe, planSubscribe, type SubscribeDeps, type SubscriberRow } from "./subscribe";
import { hashIp } from "./token";

const NOW = 1_800_000_000_000;

test.each([
  [null, "create"],
  [{ status: "pending", lastLinkAt: NOW - 11 * 60_000 }, "resend_link"],
  [{ status: "pending", lastLinkAt: NOW - 60_000 }, "noop"],
  [{ status: "confirmed", lastLinkAt: 0 }, "resend_link"],
  [{ status: "confirmed", lastLinkAt: NOW - 60_000 }, "noop"],
  [{ status: "unsubscribed", lastLinkAt: 0 }, "reconsent"],
])("planSubscribe(%o) = %s", (row, want) => expect(planSubscribe(row as never, NOW)).toBe(want));

function fakeDeps(rows: Record<string, SubscriberRow> = {}) {
  const calls = {
    upsertPending: [] as unknown[],
    touchLink: [] as unknown[],
    sendConfirmEmail: [] as [string, string][],
  };
  const deps: SubscribeDeps & { calls: typeof calls } = {
    calls,
    secret: "s".repeat(32),
    siteUrl: "https://example.com",
    now: () => NOW,
    getSubscriber: async (e) => rows[e] ?? null,
    upsertPending: async (r) => void calls.upsertPending.push(r),
    touchLink: async (...a) => void calls.touchLink.push(a),
    sendConfirmEmail: async (e, u) => void calls.sendConfirmEmail.push([e, u]),
  };
  return deps;
}

const input = { email: "a@b.co", consent: true, source: "blog" } as never;

test("new address: stores pending with consent evidence and emails a confirm link", async () => {
  const d = fakeDeps();
  await handleSubscribe(input, "1.2.3.4", d);
  expect(d.calls.upsertPending[0]).toMatchObject({
    email: "a@b.co",
    source: "blog",
    policyVersion: POLICY_VERSION,
    ipHash: hashIp("1.2.3.4", d.secret),
  });
  expect(d.calls.sendConfirmEmail[0][1]).toMatch(
    /^https:\/\/example\.com\/api\/newsletter\/confirm\?token=/,
  );
});

test("confirmed address: keeps status, only touches the link time and emails a link", async () => {
  const d = fakeDeps({ "a@b.co": { status: "confirmed", lastLinkAt: 0 } });
  await handleSubscribe(input, "ip", d);
  expect(d.calls.upsertPending).toHaveLength(0);
  expect(d.calls.touchLink).toHaveLength(1);
  expect(d.calls.sendConfirmEmail).toHaveLength(1);
});

test("unsubscribed address: re-consents as pending", async () => {
  const d = fakeDeps({ "a@b.co": { status: "unsubscribed", lastLinkAt: 0 } });
  await handleSubscribe(input, "ip", d);
  expect(d.calls.upsertPending).toHaveLength(1);
  expect(d.calls.sendConfirmEmail).toHaveLength(1);
});

test("pending inside cooldown: no email", async () => {
  const d = fakeDeps({ "a@b.co": { status: "pending", lastLinkAt: NOW - 60_000 } });
  await handleSubscribe(input, "ip", d);
  expect(d.calls.sendConfirmEmail).toHaveLength(0);
  expect(d.calls.upsertPending).toHaveLength(0);
  expect(d.calls.touchLink).toHaveLength(0);
});

test("raw IP never reaches storage", async () => {
  const d = fakeDeps();
  await handleSubscribe(input, "9.9.9.9", d);
  expect(JSON.stringify(d.calls)).not.toContain("9.9.9.9");
});

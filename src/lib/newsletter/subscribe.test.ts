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

// Stateful fake: rows change as the deps write, like the real table.
function statefulDeps(opts: { failSend?: number } = {}) {
  const rows: Record<string, SubscriberRow> = {};
  let failures = opts.failSend ?? 0;
  let t = NOW;
  const sent: string[] = [];
  const deps: SubscribeDeps = {
    secret: "s".repeat(32),
    siteUrl: "https://example.com",
    now: () => t,
    getSubscriber: async (e) => rows[e] ?? null,
    upsertPending: async (r) => {
      const prev = rows[r.email];
      if (prev?.status === "confirmed") return;
      // Like the SQL: last_link_at is only ever stamped by touchLink.
      rows[r.email] = { status: "pending", lastLinkAt: prev?.lastLinkAt ?? 0 };
    },
    touchLink: async (e, now) => {
      if (rows[e]) rows[e] = { ...rows[e], lastLinkAt: now.getTime() };
    },
    sendConfirmEmail: async (e) => {
      if (failures > 0) {
        failures--;
        throw new Error("resend down");
      }
      sent.push(e);
    },
  };
  return { deps, rows, sent, tick: (ms: number) => (t += ms) };
}

test("failed confirmation email does not start the cooldown: an immediate retry sends", async () => {
  const s = statefulDeps({ failSend: 1 });
  await expect(handleSubscribe(input, "ip", s.deps)).rejects.toThrow("resend down");
  s.tick(1000);
  await handleSubscribe(input, "ip", s.deps);
  expect(s.sent).toEqual(["a@b.co"]);
});

test("failed resend of a link to a pending address does not start the cooldown", async () => {
  const s = statefulDeps();
  await handleSubscribe(input, "ip", s.deps);
  s.tick(11 * 60_000);
  s.deps.sendConfirmEmail = async () => {
    throw new Error("resend down");
  };
  await expect(handleSubscribe(input, "ip", s.deps)).rejects.toThrow();
  s.deps.sendConfirmEmail = async (e) => void s.sent.push(e);
  s.tick(1000);
  await handleSubscribe(input, "ip", s.deps);
  expect(s.sent).toEqual(["a@b.co", "a@b.co"]);
});

test("successful send stamps the link time after sending", async () => {
  const d = fakeDeps();
  const order: string[] = [];
  d.sendConfirmEmail = async () => void order.push("send");
  d.touchLink = async () => void order.push("touch");
  d.upsertPending = async () => void order.push("upsert");
  await handleSubscribe(input, "ip", d);
  expect(order).toEqual(["upsert", "send", "touch"]);
});

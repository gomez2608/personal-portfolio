import { expect, test } from "vitest";
import type { IssuePost } from "./emails";
import type { Issue } from "./issue";
import { sendIssue, type SendDeps } from "./send";

const I: Issue = {
  issue: 1,
  date: "2026-12-01",
  subject: "Edición 1",
  preheader: "Un paper explicado simple",
  intro: "Hola.",
  posts: [{ slug: "moe", blurb: "Resumen" }],
};
const P: IssuePost[] = [
  { slug: "moe", title: "Mezcla", blurb: "Resumen", url: "https://x.co/blog/moe", imageUrl: "https://x.co/blog/og/moe" },
];
const O = { siteUrl: "https://x.co", waitMs: 1000, pollMs: 100 };

function deps(o: { claim?: "claimed" | "sending" | "sent"; live?: (url: string) => boolean; broadcastThrows?: boolean } = {}) {
  const d = {
    clock: 0,
    claims: [] as number[],
    marked: [] as [number, string][],
    broadcasts: [] as { name: string; subject: string; html: string; text: string }[],
    logs: [] as string[],
    order: [] as string[],
  };
  const api: SendDeps = {
    claimSend: async (n) => {
      d.order.push("claim");
      d.claims.push(n);
      return o.claim ?? "claimed";
    },
    markSent: async (n, id) => {
      d.order.push("mark");
      d.marked.push([n, id]);
    },
    isLive: async (url) => {
      d.order.push("live");
      return (o.live ?? (() => true))(url);
    },
    sleep: async (ms) => {
      d.clock += ms;
    },
    sendBroadcast: async (e) => {
      d.order.push("broadcast");
      if (o.broadcastThrows) throw new Error("Resend down");
      d.broadcasts.push(e);
      return `b_${d.broadcasts.length}`;
    },
    log: (m) => void d.logs.push(m),
  };
  return Object.assign(d, api);
}

test("sends once when all posts are live", async () => { const d = deps(); expect(await sendIssue(I, P, O, d)).toBe("sent"); expect(d.broadcasts).toHaveLength(1); expect(d.marked).toEqual([[1, "b_1"]]); });
test("already sent: no broadcast", async () => { const d = deps({ claim: "sent" }); expect(await sendIssue(I, P, O, d)).toBe("already-sent"); expect(d.broadcasts).toHaveLength(0); });
test("stuck claim: no broadcast", async () => { const d = deps({ claim: "sending" }); expect(await sendIssue(I, P, O, d)).toBe("stuck"); expect(d.broadcasts).toHaveLength(0); });
test("post never live: no claim, no broadcast", async () => { const d = deps({ live: () => false }); expect(await sendIssue(I, P, O, d)).toBe("not-live"); expect(d.claims).toHaveLength(0); expect(d.logs.join()).toContain(P[0].slug); });
test("post becomes live after polling", async () => { let n = 0; const d = deps({ live: () => ++n > 3 }); expect(await sendIssue(I, P, O, d)).toBe("sent"); });
test("broadcast failure leaves the claim (no retry)", async () => { const d = deps({ broadcastThrows: true }); await expect(sendIssue(I, P, O, d)).rejects.toThrow(); expect(d.marked).toHaveLength(0); });

test("order is live check, claim, broadcast, mark", async () => {
  const d = deps();
  await sendIssue(I, P, O, d);
  expect(d.order).toEqual(["live", "claim", "broadcast", "mark"]);
});
test("broadcast carries the rendered issue and its name", async () => {
  const d = deps();
  await sendIssue(I, P, O, d);
  expect(d.broadcasts[0].name).toBe("Edición 1");
  expect(d.broadcasts[0].subject).toBe("Edición 1");
  expect(d.broadcasts[0].html).toContain("https://x.co/blog/moe");
  expect(d.broadcasts[0].html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
});
test("broadcast failure is attempted exactly once", async () => {
  const d = deps({ broadcastThrows: true });
  await expect(sendIssue(I, P, O, d)).rejects.toThrow();
  expect(d.order.filter((s) => s === "broadcast")).toHaveLength(1);
  expect(d.claims).toEqual([1]);
});
test("stuck claim logs how to recover", async () => {
  const d = deps({ claim: "sending" });
  await sendIssue(I, P, O, d);
  expect(d.logs.join("\n")).toContain(
    "A previous run claimed issue 1 but didn't confirm sending. Check the Resend dashboard, then mark it in newsletter_sends.",
  );
});
test("gives up after waitMs and only reports the missing post", async () => {
  const two: IssuePost[] = [P[0], { ...P[0], slug: "otro", url: "https://x.co/blog/otro" }];
  const d = deps({ live: (u) => u.endsWith("/moe") });
  expect(await sendIssue(I, two, O, d)).toBe("not-live");
  expect(d.clock).toBeGreaterThanOrEqual(1000);
  expect(d.clock).toBeLessThan(1200);
  const log = d.logs.join("\n");
  expect(log).toContain("otro");
  expect(log).not.toMatch(/\bmoe\b.*not live|not live.*\bmoe\b/);
});
test("a throwing live check counts as not live", async () => {
  const d = deps();
  d.isLive = async () => {
    throw new Error("ECONNRESET");
  };
  expect(await sendIssue(I, P, O, d)).toBe("not-live");
  expect(d.claims).toHaveLength(0);
});
test("an unsafe post URL fails before the claim", async () => {
  const d = deps();
  await expect(sendIssue(I, [{ ...P[0], url: "javascript:alert(1)" }], O, d)).rejects.toThrow();
  expect(d.claims).toHaveLength(0);
});

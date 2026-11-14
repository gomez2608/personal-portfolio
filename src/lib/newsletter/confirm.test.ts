import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIRM_TTL_MS, POLICY_VERSION } from "./constants";
import { decideConfirm, handleConfirm, type ConfirmOutcome } from "./confirm";
import { hashIp, signConfirmToken } from "./token";

const S = "x".repeat(32);
const T0 = 1_800_000_000_000;
const NOW = T0 + 1000;
const evidence = {
  issuedAt: T0,
  policyVersion: POLICY_VERSION,
  source: "mi-post",
  ipHash: hashIp("1.2.3.4", S),
};
const token = signConfirmToken({ email: "a@b.co", ...evidence }, S);

describe("decideConfirm", () => {
  it.each([
    ["no row", "missing", null],
    ["unsubscribed row", "missing", { status: "unsubscribed", confirmedAt: T0 - 10 }],
    ["pending row", "confirmed", { status: "pending", confirmedAt: null }],
    ["confirmed before the link was issued", "reconfirmed", { status: "confirmed", confirmedAt: T0 - 1 }],
    ["confirmed with no timestamp", "reconfirmed", { status: "confirmed", confirmedAt: null }],
    ["confirmed exactly when the link was issued", "already", { status: "confirmed", confirmedAt: T0 }],
    ["confirmed after the link was issued", "already", { status: "confirmed", confirmedAt: T0 + 1 }],
  ] as const)("%s → %s", (_name, want, row) => expect(decideConfirm(row, T0)).toBe(want));
});

function setup(outcome: ConfirmOutcome = "confirmed") {
  const markConfirmed = vi.fn().mockResolvedValue(outcome);
  const addToSegment = vi.fn().mockResolvedValue(undefined);
  return { markConfirmed, addToSegment, secret: S, now: () => NOW };
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

describe("handleConfirm", () => {
  it("pending → confirmada: writes the token's evidence and resubscribes", async () => {
    const d = setup("confirmed");
    expect(await handleConfirm(token, d)).toBe("confirmada");
    expect(d.markConfirmed).toHaveBeenCalledWith("a@b.co", evidence, new Date(NOW));
    expect(d.addToSegment).toHaveBeenCalledWith("a@b.co", { resubscribe: true });
  });

  it("fresh link on a confirmed row → confirmada and resubscribes (may rejoin)", async () => {
    const d = setup("reconfirmed");
    expect(await handleConfirm(token, d)).toBe("confirmada");
    expect(d.addToSegment).toHaveBeenCalledWith("a@b.co", { resubscribe: true });
  });

  it("stale link → ya-confirmada and only heals: never resubscribes", async () => {
    const d = setup("already");
    expect(await handleConfirm(token, d)).toBe("ya-confirmada");
    expect(d.addToSegment).toHaveBeenCalledWith("a@b.co", { resubscribe: false });
  });

  it("missing row is invalid and does not touch the segment", async () => {
    const d = setup("missing");
    expect(await handleConfirm(token, d)).toBe("invalida");
    expect(d.addToSegment).not.toHaveBeenCalled();
  });

  it("expired token never calls markConfirmed", async () => {
    const d = { ...setup(), now: () => T0 + CONFIRM_TTL_MS + 1 };
    expect(await handleConfirm(token, d)).toBe("expirada");
    expect(d.markConfirmed).not.toHaveBeenCalled();
  });

  it.each([undefined, null, "", 42, "garbage"])("bad token %s is invalid", async (t) => {
    const d = setup();
    expect(await handleConfirm(t, d)).toBe("invalida");
    expect(d.markConfirmed).not.toHaveBeenCalled();
  });

  it("addToSegment failure returns error (DB stays confirmed)", async () => {
    const d = setup("confirmed");
    d.addToSegment.mockRejectedValue(new Error("boom"));
    expect(await handleConfirm(token, d)).toBe("error");
    expect(d.markConfirmed).toHaveBeenCalledTimes(1);
  });

  it("markConfirmed failure returns error", async () => {
    const d = setup();
    d.markConfirmed.mockRejectedValue(new Error("db"));
    expect(await handleConfirm(token, d)).toBe("error");
    expect(d.addToSegment).not.toHaveBeenCalled();
  });
});

describe("confirm flow end to end (fake table + fake Resend)", () => {
  type Row = { status: "pending" | "confirmed" | "unsubscribed"; confirmedAt: number | null; source: string };

  function world() {
    const rows = new Map<string, Row>([["a@b.co", { status: "pending", confirmedAt: null, source: "blog" }]]);
    const contact = { exists: false, unsubscribed: false };
    let t = T0;
    const deps = {
      secret: S,
      now: () => t,
      markConfirmed: async (email: string, ev: typeof evidence, now: Date) => {
        const row = rows.get(email) ?? null;
        const out = decideConfirm(row, ev.issuedAt);
        if (out === "confirmed" || out === "reconfirmed") {
          rows.set(email, { status: "confirmed", confirmedAt: now.getTime(), source: ev.source });
        }
        return out;
      },
      addToSegment: async (_email: string, { resubscribe }: { resubscribe: boolean }) => {
        if (!contact.exists) Object.assign(contact, { exists: true, unsubscribed: false });
        else if (resubscribe) contact.unsubscribed = false;
      },
    };
    const link = (issuedAt: number) =>
      signConfirmToken({ email: "a@b.co", ...evidence, issuedAt }, S);
    return { rows, contact, deps, link, at: (ms: number) => (t = ms) };
  }

  it("stale link after unsubscribe does not flip unsubscribed", async () => {
    const w = world();
    const first = w.link(T0);
    w.at(T0 + 60_000);
    expect(await handleConfirm(first, w.deps)).toBe("confirmada");
    w.contact.unsubscribed = true; // the reader clicks "Darte de baja" in a newsletter
    w.at(T0 + 2 * 24 * 3600_000);
    expect(await handleConfirm(first, w.deps)).toBe("ya-confirmada");
    expect(w.contact.unsubscribed).toBe(true);
  });

  it("a new link requested after unsubscribing re-subscribes", async () => {
    const w = world();
    w.at(T0 + 60_000);
    await handleConfirm(w.link(T0), w.deps);
    w.contact.unsubscribed = true;
    const fresh = w.link(T0 + 3600_000);
    w.at(T0 + 3600_000 + 5000);
    expect(await handleConfirm(fresh, w.deps)).toBe("confirmada");
    expect(w.contact.unsubscribed).toBe(false);
    expect(w.rows.get("a@b.co")?.confirmedAt).toBe(T0 + 3600_000 + 5000);
  });

  it("clicking the same link twice: confirmada, then ya-confirmada with no second write", async () => {
    const w = world();
    const link = w.link(T0);
    w.at(T0 + 1000);
    expect(await handleConfirm(link, w.deps)).toBe("confirmada");
    w.at(T0 + 2000);
    expect(await handleConfirm(link, w.deps)).toBe("ya-confirmada");
    expect(w.rows.get("a@b.co")?.confirmedAt).toBe(T0 + 1000);
  });
});

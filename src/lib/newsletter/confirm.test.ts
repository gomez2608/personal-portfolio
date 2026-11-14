import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIRM_TTL_MS } from "./constants";
import { handleConfirm } from "./confirm";
import { signConfirmToken } from "./token";

const S = "x".repeat(32);
const T0 = 1_800_000_000_000;
const token = signConfirmToken("a@b.co", T0, S);

function setup(status: "confirmed" | "already" | "missing" = "confirmed") {
  const markConfirmed = vi.fn().mockResolvedValue(status);
  const addToSegment = vi.fn().mockResolvedValue(undefined);
  return { markConfirmed, addToSegment, secret: S, now: () => T0 + 1000 };
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

describe("handleConfirm", () => {
  it("confirms and adds to the segment", async () => {
    const d = setup("confirmed");
    expect(await handleConfirm(token, d)).toBe("confirmada");
    expect(d.markConfirmed).toHaveBeenCalledWith("a@b.co", new Date(T0 + 1000));
    expect(d.addToSegment).toHaveBeenCalledWith("a@b.co");
  });

  it("already confirmed still calls addToSegment to heal", async () => {
    const d = setup("already");
    expect(await handleConfirm(token, d)).toBe("ya-confirmada");
    expect(d.addToSegment).toHaveBeenCalledWith("a@b.co");
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

import { describe, expect, it, vi } from "vitest";
import { syncContact, type ContactsApi } from "./contact-sync";

const ok = { error: null };
const fail = (message: string) => ({ error: { message } });

function api(createResult: { error: { message: string } | null } = ok) {
  return {
    create: vi.fn().mockResolvedValue(createResult),
    update: vi.fn().mockResolvedValue(ok),
    segments: { add: vi.fn().mockResolvedValue(ok) },
  } satisfies ContactsApi;
}

describe("syncContact, fresh consent (resubscribe: true)", () => {
  it("creates a missing contact subscribed and in the segment", async () => {
    const a = api();
    await syncContact(a, "seg", "a@b.co", { resubscribe: true });
    expect(a.create).toHaveBeenCalledWith({ email: "a@b.co", unsubscribed: false, segments: [{ id: "seg" }] });
    expect(a.update).not.toHaveBeenCalled();
  });

  it("re-subscribes an existing contact and adds it to the segment", async () => {
    const a = api(fail("exists"));
    await syncContact(a, "seg", "a@b.co", { resubscribe: true });
    expect(a.update).toHaveBeenCalledWith({ email: "a@b.co", unsubscribed: false });
    expect(a.segments.add).toHaveBeenCalledWith({ email: "a@b.co", segmentId: "seg" });
  });

  it("throws when the update fails", async () => {
    const a = api(fail("exists"));
    a.update.mockResolvedValue(fail("nope"));
    await expect(syncContact(a, "seg", "a@b.co", { resubscribe: true })).rejects.toThrow();
  });
});

describe("syncContact, stale link (resubscribe: false)", () => {
  it("creates a missing contact in the segment without an unsubscribed flag", async () => {
    const a = api();
    await syncContact(a, "seg", "a@b.co", { resubscribe: false });
    expect(a.create).toHaveBeenCalledWith({ email: "a@b.co", segments: [{ id: "seg" }] });
  });

  it("never sets unsubscribed:false on an existing contact; only ensures segment membership", async () => {
    const a = api(fail("exists"));
    await syncContact(a, "seg", "a@b.co", { resubscribe: false });
    expect(a.update).not.toHaveBeenCalled();
    expect(a.segments.add).toHaveBeenCalledWith({ email: "a@b.co", segmentId: "seg" });
  });

  it("throws when adding to the segment fails", async () => {
    const a = api(fail("exists"));
    a.segments.add.mockResolvedValue(fail("nope"));
    await expect(syncContact(a, "seg", "a@b.co", { resubscribe: false })).rejects.toThrow();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const markConfirmed = vi.fn();
const addToSegment = vi.fn();
vi.mock("@/lib/newsletter/db", () => ({
  markConfirmed: (...a: unknown[]) => markConfirmed(...a),
  getSubscriber: vi.fn().mockResolvedValue(null),
  upsertPending: vi.fn(),
  touchLink: vi.fn(),
}));
vi.mock("@/lib/newsletter/resend", () => ({
  addToSegment: (...a: unknown[]) => addToSegment(...a),
  sendEmail: vi.fn(),
}));

import { GET } from "./confirm/route";
import { POST } from "./subscribe/route";
import { POLICY_VERSION } from "@/lib/newsletter/constants";
import { hashIp, signConfirmToken } from "@/lib/newsletter/token";

const S = "x".repeat(32);

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  markConfirmed.mockReset();
  addToSegment.mockReset();
  process.env.NEWSLETTER_SECRET = S;
});

const post = (body: unknown, ip = "9.9.9.9") =>
  POST(
    new Request("http://x/api/newsletter/subscribe", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );

describe("GET /api/newsletter/confirm", () => {
  it("redirects 303 with no-referrer on success", async () => {
    markConfirmed.mockResolvedValue("confirmed");
    const t = signConfirmToken(
      { email: "a@b.co", issuedAt: Date.now(), policyVersion: POLICY_VERSION, source: "blog", ipHash: hashIp("1.2.3.4", S) },
      S,
    );
    const res = await GET(new Request(`http://x/api/newsletter/confirm?token=${encodeURIComponent(t)}`));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://x/blog/suscripcion?estado=confirmada");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    expect(addToSegment).toHaveBeenCalledWith("a@b.co", { resubscribe: true });
  });
  it("stale link redirects to ya-confirmada without resubscribing", async () => {
    markConfirmed.mockResolvedValue("already");
    const t = signConfirmToken(
      { email: "a@b.co", issuedAt: Date.now(), policyVersion: POLICY_VERSION, source: "blog", ipHash: hashIp("1.2.3.4", S) },
      S,
    );
    const res = await GET(new Request(`http://x/api/newsletter/confirm?token=${encodeURIComponent(t)}`));
    expect(res.headers.get("location")).toContain("estado=ya-confirmada");
    expect(addToSegment).toHaveBeenCalledWith("a@b.co", { resubscribe: false });
  });
  it("missing token is invalida", async () => {
    const res = await GET(new Request("http://x/api/newsletter/confirm"));
    expect(res.headers.get("location")).toContain("estado=invalida");
  });
  it("short secret is error and never reaches the db", async () => {
    process.env.NEWSLETTER_SECRET = "short";
    const res = await GET(new Request("http://x/api/newsletter/confirm?token=abc"));
    expect(res.headers.get("location")).toContain("estado=error");
    expect(markConfirmed).not.toHaveBeenCalled();
  });
});

describe("POST /api/newsletter/subscribe", () => {
  it("honeypot returns ok", async () => {
    const res = await post({ email: "a@b.co", consent: true, company: "x" }, "1.1.1.1");
    expect(await res.json()).toEqual({ ok: true });
  });
  it("invalid input is 400", async () => {
    const res = await post({ email: "nope", consent: true }, "2.2.2.2");
    expect(res.status).toBe(400);
  });
  it("missing secret is 500 server", async () => {
    delete process.env.NEWSLETTER_SECRET;
    const res = await post({ email: "a@b.co", consent: true }, "3.3.3.3");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "server" });
  });
  it("valid request is ok, 6th from one ip is 429", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await post({ email: "a@b.co", consent: true }, "4.4.4.4")).status).toBe(200);
    }
    const res = await post({ email: "a@b.co", consent: true }, "4.4.4.4");
    expect(res.status).toBe(429);
  });
});

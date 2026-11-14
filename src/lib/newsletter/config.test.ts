import { expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { isNewsletterConfigured } = await import("./config");

const FULL = {
  RESEND_API_KEY: "re_x",
  RESEND_NEWSLETTER_SEGMENT_ID: "seg",
  NEWSLETTER_SECRET: "s".repeat(32),
  DATABASE_URL: "postgres://x",
};

test("true only when every required variable is set", () => expect(isNewsletterConfigured(FULL)).toBe(true));
test("an empty env is not configured", () => expect(isNewsletterConfigured({})).toBe(false));
test.each(Object.keys(FULL))("missing %s is not configured", (k) =>
  expect(isNewsletterConfigured({ ...FULL, [k]: undefined })).toBe(false));
test.each(Object.keys(FULL))("blank %s is not configured", (k) =>
  expect(isNewsletterConfigured({ ...FULL, [k]: "  " })).toBe(false));
test("a secret shorter than 32 characters is not configured", () =>
  expect(isNewsletterConfigured({ ...FULL, NEWSLETTER_SECRET: "s".repeat(31) })).toBe(false));
test("NEWSLETTER_FROM_EMAIL is optional", () =>
  expect(isNewsletterConfigured({ ...FULL, NEWSLETTER_FROM_EMAIL: undefined })).toBe(true));

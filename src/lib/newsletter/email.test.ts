import { expect, test } from "vitest";
import { SubscribeSchema, normalizeEmail } from "./email";

test("normalizes case and whitespace", () => expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com"));
test("schema normalizes and requires consent true", () => {
  expect(SubscribeSchema.parse({ email: " Ana@Example.com", consent: true }).email).toBe("ana@example.com");
  expect(SubscribeSchema.safeParse({ email: "ana@example.com", consent: false }).success).toBe(false);
  expect(SubscribeSchema.safeParse({ email: "ana@example.com" }).success).toBe(false);
});
test("rejects bad email and bad source", () => {
  expect(SubscribeSchema.safeParse({ email: "ana@", consent: true }).success).toBe(false);
  expect(SubscribeSchema.safeParse({ email: "a@b.co", consent: true, source: "Bad Source" }).success).toBe(false);
});
test("source defaults to blog", () => expect(SubscribeSchema.parse({ email: "a@b.co", consent: true }).source).toBe("blog"));

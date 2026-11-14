import { expect, test } from "vitest";
import { SubscribeSchema, normalizeEmail } from "./email";

test("normalizes case and whitespace", () => expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com"));
test("schema normalizes and requires consent true", () => {
  expect(SubscribeSchema.parse({ email: " Ana@Example.com", consent: true }).email).toBe("ana@example.com");
  expect(SubscribeSchema.safeParse({ email: "ana@example.com", consent: false }).success).toBe(false);
  expect(SubscribeSchema.safeParse({ email: "ana@example.com" }).success).toBe(false);
});
test("rejects a bad email", () => expect(SubscribeSchema.safeParse({ email: "ana@", consent: true }).success).toBe(false));
test.each([["Bad Source"], ["s".repeat(81)], [42], [null], [""]])(
  "an invalid source (%j) falls back to blog instead of blocking the signup",
  (source) => expect(SubscribeSchema.parse({ email: "a@b.co", consent: true, source }).source).toBe("blog"),
);
test("a valid post slug is kept as the source", () =>
  expect(SubscribeSchema.parse({ email: "a@b.co", consent: true, source: "mi-post-2" }).source).toBe("mi-post-2"));
test("source defaults to blog", () => expect(SubscribeSchema.parse({ email: "a@b.co", consent: true }).source).toBe("blog"));

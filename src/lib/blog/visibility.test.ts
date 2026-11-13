import { afterEach, expect, test, vi } from "vitest";
import { deploymentEnv, isPostVisible } from "./visibility";

afterEach(() => vi.unstubAllEnvs());

test("draft hidden in production only", () => {
  expect(isPostVisible({ status: "draft" }, "production")).toBe(false);
  expect(isPostVisible({ status: "draft" }, "preview")).toBe(true);
  expect(isPostVisible({ status: "draft" }, "development")).toBe(true);
  expect(isPostVisible({ status: "published" }, "production")).toBe(true);
});

test("deploymentEnv prefers VERCEL_ENV", () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  expect(deploymentEnv()).toBe("preview");
});

test("deploymentEnv falls back to NODE_ENV", () => {
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("NODE_ENV", "production");
  expect(deploymentEnv()).toBe("production");
  vi.stubEnv("NODE_ENV", "development");
  expect(deploymentEnv()).toBe("development");
});

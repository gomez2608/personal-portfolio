import { expect, test } from "vitest";
import { groupScale } from "./atoms";

test("Group never scales below 1, so labels inside stay ≥34px", () => {
  expect(groupScale(0.25)).toBe(1);
  expect(groupScale(1.5)).toBe(1.5);
  expect(groupScale(undefined)).toBe(1);
});

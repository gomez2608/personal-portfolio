import { expect, test } from "vitest";
import { formatDateEs } from "./format";

test("formats Spanish long date", () => expect(formatDateEs("2026-11-13")).toBe("13 de noviembre de 2026"));
test("does not shift day across time zones", () => expect(formatDateEs("2026-01-01")).toBe("1 de enero de 2026"));

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { readPostEntries } from "./entries";

let root: string;
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

test("registers only clips/clip-<n>.tsx files", () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-entries-"));
  const clips = path.join(root, "post", "clips");
  fs.mkdirSync(clips, { recursive: true });
  fs.writeFileSync(path.join(root, "post", "post.json"), "{}");
  for (const f of ["clip-2.tsx", "clip-1.tsx", "shared.tsx", "clip-1.test.tsx", "clip-a.tsx", "clip-3.ts"]) {
    fs.writeFileSync(path.join(clips, f), "");
  }
  expect(readPostEntries(root)[0].clipFiles).toEqual(["clip-1", "clip-2"]);
});

test("reads each clip's source into clipSources", () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-entries-"));
  const clips = path.join(root, "post", "clips");
  fs.mkdirSync(clips, { recursive: true });
  fs.writeFileSync(path.join(root, "post", "post.json"), "{}");
  fs.writeFileSync(path.join(clips, "clip-1.tsx"), "uno");
  fs.writeFileSync(path.join(clips, "shared.tsx"), "no");
  expect(readPostEntries(root)[0].clipSources).toEqual({ "clip-1": "uno" });
});

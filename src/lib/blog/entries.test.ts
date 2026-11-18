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

test("hasCover reflects public/blog/<dir>/cover.png", () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-entries-"));
  const app = path.join(root, "app");
  const covers = path.join(root, "covers");
  for (const d of ["with", "without"]) {
    fs.mkdirSync(path.join(app, d), { recursive: true });
    fs.writeFileSync(path.join(app, d, "post.json"), "{}");
  }
  fs.mkdirSync(path.join(covers, "with"), { recursive: true });
  fs.writeFileSync(path.join(covers, "with", "cover.png"), "");
  const byDir = Object.fromEntries(readPostEntries(app, covers).map((e) => [e.dir, e.hasCover]));
  expect(byDir).toEqual({ with: true, without: false });
});

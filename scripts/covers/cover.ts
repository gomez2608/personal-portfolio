/**
 * Saves a post's cover: the last frame of its clip-1 (the 1280×720 stage, no caption bar),
 * used by the share card at /blog/og/<slug> and so by the newsletter email.
 *   npm run blog:cover -- <slug> [--base http://localhost:3000]
 * Needs a running dev server (npm run dev) and Chromium, like blog:snap
 * (CHROME_PATH for an installed Chrome). Writes public/blog/<slug>/cover.png.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { readPostEntries } from "../../src/lib/blog/entries";
import { resolveChromePath } from "../blog/chrome-path";

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const base = (baseIdx >= 0 ? args[baseIdx + 1] : "http://localhost:3000").replace(/\/$/, "");
const slug = args.find((a, i) => !a.startsWith("--") && (baseIdx < 0 || i !== baseIdx + 1));

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

if (!slug) fail("Usage: npm run blog:cover -- <slug> [--base http://localhost:3000]");
const entry = readPostEntries().find((e) => e.dir === slug);
if (!entry) fail(`No post folder app/blog/${slug}`);
if (!entry.clipFiles.includes("clip-1")) fail(`app/blog/${slug} has no clips/clip-1.tsx: the cover is its last frame`);

async function main() {
  try {
    await fetch(base, { method: "HEAD" });
  } catch {
    fail(`Cannot reach ${base}. Start the dev server first: npm run dev`);
  }

  let browser;
  try {
    browser = await chromium.launch({ executablePath: resolveChromePath(process.env) });
  } catch (e) {
    fail(`Could not launch Chromium (${(e as Error).message.split("\n")[0]}). Install it with npx playwright install chromium, or set CHROME_PATH.`);
  }

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = "nextjs-portal { display: none !important; }";
        document.head.appendChild(style);
      });
    });

    const url = (frame: number) => `${base}/blog/clip-preview/${slug}/clip-1?frame=${frame}`;
    const open = async (frame: number) => {
      const res = await page.goto(url(frame), { waitUntil: "load" });
      if (!res || res.status() === 404) fail(`404 at ${url(frame)}`);
      await page.waitForSelector('[data-ready="true"]', { timeout: 60_000 });
      if (await page.locator('[data-missing="true"], [data-error="true"]').count()) {
        fail(`clip-1 did not load at ${url(frame)} (run npm run blog:registry, or open the URL to see the error)`);
      }
    };

    await open(0);
    const duration = Number(await page.locator("[data-duration]").getAttribute("data-duration"));
    await open(duration - 1);

    const out = path.join("public", "blog", slug as string, "cover.png");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.locator("[data-stage]").screenshot({ path: out });
    console.log(out);
  } finally {
    await browser.close();
  }
}

main();

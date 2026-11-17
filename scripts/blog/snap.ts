/**
 * Screenshots every clip of a post at fixed frames, for spotting layout glitches.
 *   npm run blog:snap -- <slug> [--base http://localhost:3000]
 * Needs a running dev server (npm run dev) and Chromium: Playwright's own
 * (npx playwright install chromium), or set CHROME_PATH to an installed Chrome/Chromium.
 * Each PNG is the 1280×720 stage plus the caption bar under it.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { readPostEntries } from "../../src/lib/blog/entries";
import { resolveChromePath } from "./chrome-path";

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const base = (baseIdx >= 0 ? args[baseIdx + 1] : "http://localhost:3000").replace(/\/$/, "");
const slug = args.find((a, i) => !a.startsWith("--") && (baseIdx < 0 || i !== baseIdx + 1));

if (!slug) {
  console.error("Usage: npm run blog:snap -- <slug> [--base http://localhost:3000]");
  process.exit(1);
}

const entry = readPostEntries().find((e) => e.dir === slug);
if (!entry) {
  console.error(`No post folder app/blog/${slug}`);
  process.exit(1);
}
if (entry.clipFiles.length === 0) {
  console.error(`app/blog/${slug} has no clips`);
  process.exit(1);
}

async function main() {
  try {
    await fetch(base, { method: "HEAD" });
  } catch {
    console.error(`Cannot reach ${base}. Start the dev server first: npm run dev`);
    process.exit(1);
  }

  let browser;
  try {
    browser = await chromium.launch({ executablePath: resolveChromePath(process.env) });
  } catch (e) {
    console.error(
      `Could not launch Chromium (${(e as Error).message.split("\n")[0]}).\nInstall it once with: npx playwright install chromium (or set CHROME_PATH to an installed Chrome).`,
    );
    process.exit(1);
  }

  const outDir = path.join(".blog-snaps", slug as string);
  fs.mkdirSync(outDir, { recursive: true });
  const files: string[] = [];
  const failures: string[] = [];

  try {
    // Taller than the stage so the caption bar under it fits in the viewport too.
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    // Hide the Next.js dev indicator so it doesn't end up in the screenshots.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = "nextjs-portal { display: none !important; }";
        document.head.appendChild(style);
      });
    });

    for (const clip of entry!.clipFiles) {
      const url = (frame: number) => `${base}/blog/clip-preview/${slug}/${clip}?frame=${frame}`;
      const open = async (frame: number) => {
        let res;
        try {
          res = await page.goto(url(frame), { waitUntil: "load" });
        } catch (e) {
          failures.push(`${clip}: could not open ${url(frame)} (${(e as Error).message.split("\n")[0]})`);
          return null;
        }
        if (!res || res.status() === 404) {
          failures.push(`${clip}: 404 at ${url(frame)}`);
          return null;
        }
        try {
          await page.waitForSelector('[data-ready="true"]', { timeout: 30_000 });
        } catch {
          failures.push(`${clip}: timed out waiting for data-ready at ${url(frame)}`);
          return null;
        }
        if (await page.locator('[data-missing="true"]').count()) {
          failures.push(`${clip}: not in the clip registry (run npm run blog:registry)`);
          return null;
        }
        if (await page.locator('[data-error="true"]').count()) {
          const message = await page.locator("[data-error-message]").innerText();
          failures.push(`${clip}: failed to load: ${message}`);
          return null;
        }
        return page.locator("[data-snap]");
      };

      try {
        const first = await open(0);
        if (!first) continue;
        const duration = Number(await page.locator("[data-duration]").getAttribute("data-duration"));
        const frames = [...new Set([0, 0.25, 0.5, 0.75].map((f) => Math.round(duration * f)).concat(duration - 1))];

        for (const frame of frames) {
          const stage = frame === 0 ? first : await open(frame);
          if (!stage) break;
          const file = path.join(outDir, `${clip}-${frame}.png`);
          await stage.screenshot({ path: file });
          files.push(file);
        }
      } catch (e) {
        failures.push(`${clip}: ${(e as Error).message.split("\n")[0]}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(files.join("\n"));
  if (failures.length > 0) {
    console.error(failures.map((f) => `FAIL ${f}`).join("\n"));
    process.exit(1);
  }
}

main();

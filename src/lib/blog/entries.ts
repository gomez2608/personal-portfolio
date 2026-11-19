import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { RESERVED_SLUGS } from "./schema";

/** Raw on-disk data for one `app/blog/<dir>/` folder. */
export type PostEntry = {
  dir: string;
  meta: unknown;
  mdx: string | null;
  /** Clip basenames without extension, sorted. */
  clipFiles: string[];
  /** Each clip's source, by basename (same keys as `clipFiles`), for the brand check. */
  clipSources?: Record<string, string>;
  /** Whether `<coversRoot>/<dir>/cover.png` exists (the share card image). */
  hasCover?: boolean;
};

/** Only `clips/clip-<n>.tsx` are clips; helpers and tests in the folder are not registered. */
const CLIP_FILE = /^clip-\d+\.tsx$/;

/**
 * Reads every post folder under `root`. Skips reserved slugs, plain files and
 * folders without a post.json. Returns [] when `root` does not exist.
 * Kept free of `server-only` so build scripts can import it.
 */
export function readPostEntries(root = "app/blog", coversRoot = "public/blog"): PostEntry[] {
  if (!fs.existsSync(root)) return [];
  const reserved: readonly string[] = RESERVED_SLUGS;
  const entries: PostEntry[] = [];
  for (const dirent of fs.readdirSync(root, { withFileTypes: true })) {
    if (!dirent.isDirectory() || reserved.includes(dirent.name)) continue;
    const dir = path.join(root, dirent.name);
    const metaPath = path.join(dir, "post.json");
    if (!fs.existsSync(metaPath)) continue;
    let meta: unknown;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      meta = null;
    }
    const mdxPath = path.join(dir, "page.mdx");
    const clipsDir = path.join(dir, "clips");
    const clipFiles = fs.existsSync(clipsDir)
      ? fs
          .readdirSync(clipsDir)
          .filter((f) => CLIP_FILE.test(f))
          .map((f) => f.replace(/\.tsx$/, ""))
          .sort()
      : [];
    entries.push({
      dir: dirent.name,
      meta,
      mdx: fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, "utf8") : null,
      clipFiles,
      hasCover: fs.existsSync(path.join(coversRoot, dirent.name, "cover.png")),
      clipSources: Object.fromEntries(
        clipFiles.map((c) => [c, fs.readFileSync(path.join(clipsDir, `${c}.tsx`), "utf8")]),
      ),
    });
  }
  return entries.sort((a, b) => a.dir.localeCompare(b.dir));
}

/**
 * The share card's path, with `?v=` set from the cover's bytes. Mail and social image
 * proxies (Gmail, LinkedIn) cache by URL, so a new cover needs a new URL to show up.
 */
export function ogImagePath(slug: string, coversRoot = "public/blog"): string {
  const base = `/blog/og/${slug}`;
  try {
    const png = fs.readFileSync(path.join(coversRoot, slug, "cover.png"));
    return `${base}?v=${crypto.createHash("sha256").update(png).digest("hex").slice(0, 8)}`;
  } catch {
    return base;
  }
}

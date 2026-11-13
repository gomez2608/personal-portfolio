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
};

const CLIP_EXT = /\.tsx$/;

/**
 * Reads every post folder under `root`. Skips reserved slugs, plain files and
 * folders without a post.json. Returns [] when `root` does not exist.
 * Kept free of `server-only` so build scripts can import it.
 */
export function readPostEntries(root = "app/blog"): PostEntry[] {
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
    entries.push({
      dir: dirent.name,
      meta,
      mdx: fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, "utf8") : null,
      clipFiles: fs.existsSync(clipsDir)
        ? fs
            .readdirSync(clipsDir)
            .filter((f) => CLIP_EXT.test(f))
            .map((f) => f.replace(CLIP_EXT, ""))
            .sort()
        : [],
    });
  }
  return entries.sort((a, b) => a.dir.localeCompare(b.dir));
}

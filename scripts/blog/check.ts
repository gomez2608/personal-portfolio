import fs from "node:fs";
import path from "node:path";
import { readPostEntries } from "../../src/lib/blog/entries";
import { renderRegistrySource } from "../../src/lib/blog/registry";
import { validateClipModules, validatePosts } from "../../src/lib/blog/validate";

const REGISTRY_PATH = "src/lib/blog/clip-registry.generated.ts";

async function main() {
  const entries = readPostEntries();
  const errors = validatePosts(entries, new Date().toISOString().slice(0, 10));

  const current = fs.existsSync(REGISTRY_PATH) ? fs.readFileSync(REGISTRY_PATH, "utf8") : null;
  if (current !== renderRegistrySource(entries)) {
    errors.push(`${REGISTRY_PATH} is out of date: run npm run blog:registry`);
  }

  // Clip modules are "use client" files, but tsx loads them fine in Node: importing one runs
  // defineClip, and validateClipModules re-checks the definition it exports.
  errors.push(
    ...(await validateClipModules(entries, (dir, clip) =>
      import(path.resolve("app/blog", dir, "clips", `${clip}.tsx`)),
    )),
  );

  if (errors.length > 0) {
    console.error(errors.map((e) => `- ${e}`).join("\n"));
    process.exit(1);
  }
  const clips = entries.reduce((n, e) => n + e.clipFiles.length, 0);
  console.log(`blog:check ok (${entries.length} posts, ${clips} clips)`);
}

main();

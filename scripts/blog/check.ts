import fs from "node:fs";
import { readPostEntries } from "../../src/lib/blog/entries";
import { renderRegistrySource } from "../../src/lib/blog/registry";
import { validatePosts } from "../../src/lib/blog/validate";

const REGISTRY_PATH = "src/lib/blog/clip-registry.generated.ts";
const entries = readPostEntries();
const errors = validatePosts(entries, new Date().toISOString().slice(0, 10));

const current = fs.existsSync(REGISTRY_PATH) ? fs.readFileSync(REGISTRY_PATH, "utf8") : null;
if (current !== renderRegistrySource(entries)) {
  errors.push(`${REGISTRY_PATH} is out of date: run npm run blog:registry`);
}

if (errors.length > 0) {
  console.error(errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}
console.log(`blog:check ok (${entries.length} posts)`);

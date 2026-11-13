import fs from "node:fs";
import { readPostEntries } from "../../src/lib/blog/entries";
import { renderRegistrySource } from "../../src/lib/blog/registry";

fs.writeFileSync(
  "src/lib/blog/clip-registry.generated.ts",
  renderRegistrySource(readPostEntries()),
);

import type { Metadata } from "next";
import { site } from "@/app/data/site";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * Next.js merges metadata shallowly per key, so any blog `openGraph` replaces the
 * root layout's entirely. Build it complete here instead of overriding one field.
 */
export function blogOpenGraph(overrides: Partial<OpenGraph> & { image?: string } = {}): OpenGraph {
  const { image = "/og-image.png", ...rest } = overrides;
  return {
    type: "website",
    siteName: site.name,
    locale: "es_CO",
    images: [{ url: image, width: 1200, height: 630 }],
    ...rest,
  } as OpenGraph;
}

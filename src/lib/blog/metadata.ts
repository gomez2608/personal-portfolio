import type { Metadata } from "next";
import { site } from "@/app/data/site";

export type BlogSocialInput = {
  title?: string;
  description?: string;
  /** Site path such as `/blog/<slug>`; sets the canonical URL and `og:url`. */
  path?: string;
  /** Site path of a 1200×630 image. Defaults to the site's OG card. */
  image?: string;
  imageAlt?: string;
  /** Makes the page an Open Graph article. */
  publishedTime?: string;
};

type SocialMetadata = Pick<Metadata, "openGraph" | "twitter" | "alternates">;

const abs = (p: string) => `${site.url}${p}`;

/**
 * Open Graph, Twitter card and canonical for blog pages. Next.js merges metadata shallowly
 * per key, so a blog `openGraph` or `twitter` replaces the root layout's entirely: build
 * them complete here instead of overriding one field.
 */
export function blogSocialMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  publishedTime,
}: BlogSocialInput = {}): SocialMetadata {
  const url = path ? abs(path) : undefined;
  const img = image
    ? { url: abs(image), alt: imageAlt ?? title ?? site.name }
    : { url: abs("/og-image.png"), alt: `${site.name} — ${site.role}` };

  const og = {
    siteName: site.name,
    locale: "es_CO",
    images: [{ url: img.url, width: 1200, height: 630, alt: img.alt }],
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
  };

  return {
    openGraph: publishedTime ? { ...og, type: "article", publishedTime } : { ...og, type: "website" },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [img],
    },
    ...(url ? { alternates: { canonical: url } } : {}),
  };
}

import { describe, expect, test } from "vitest";
import { site } from "@/app/data/site";
import { blogSocialMetadata } from "./metadata";

describe("blogSocialMetadata", () => {
  const post = blogSocialMetadata({
    title: "Mezcla de expertos",
    description: "Un gancho",
    path: "/blog/mezcla-de-expertos",
    image: "/blog/og/mezcla-de-expertos",
    imageAlt: "Mezcla de expertos",
    publishedTime: "2026-11-13",
  });

  test("open graph keeps site name and Spanish locale", () => {
    expect(post.openGraph).toMatchObject({ siteName: site.name, locale: "es_CO", type: "article", publishedTime: "2026-11-13" });
  });

  test("open graph image is absolute, sized and has alt text", () => {
    expect(post.openGraph?.images).toEqual([
      { url: `${site.url}/blog/og/mezcla-de-expertos`, width: 1200, height: 630, alt: "Mezcla de expertos" },
    ]);
  });

  test("canonical and og:url are the absolute URL", () => {
    expect(post.alternates?.canonical).toBe(`${site.url}/blog/mezcla-de-expertos`);
    expect(post.openGraph?.url).toBe(`${site.url}/blog/mezcla-de-expertos`);
  });

  test("emits a large-image twitter card with title, description and image", () => {
    expect(post.twitter).toEqual({
      card: "summary_large_image",
      title: "Mezcla de expertos",
      description: "Un gancho",
      images: [{ url: `${site.url}/blog/og/mezcla-de-expertos`, alt: "Mezcla de expertos" }],
    });
  });

  test("defaults: website type, site OG image with alt, no canonical", () => {
    const d = blogSocialMetadata();
    expect(d.openGraph).toMatchObject({ type: "website", siteName: site.name, locale: "es_CO" });
    expect(d.openGraph?.images).toEqual([
      { url: `${site.url}/og-image.png`, width: 1200, height: 630, alt: `${site.name} — ${site.role}` },
    ]);
    expect(d.twitter).toMatchObject({ card: "summary_large_image" });
    expect(d.alternates).toBeUndefined();
  });
});

import type { MetadataRoute } from "next";
import { site } from "@/app/data/site";
import { listPosts } from "@/lib/blog/posts";
import { deploymentEnv, isPostVisible } from "@/lib/blog/visibility";

export default function sitemap(): MetadataRoute.Sitemap {
  const env = deploymentEnv();
  const posts = listPosts().filter((p) => isPostVisible(p, env));
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/blog`,
      lastModified: posts[0] ? new Date(posts[0].date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.date),
    })),
  ];
}

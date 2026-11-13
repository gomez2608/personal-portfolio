import "server-only";
import { readPostEntries } from "./entries";
import { PostMetaSchema, type PostMeta } from "./schema";

export { readPostEntries, type PostEntry } from "./entries";

/** All valid posts, newest first (ties by issue desc). */
export function listPosts(): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const entry of readPostEntries()) {
    const parsed = PostMetaSchema.safeParse(entry.meta);
    if (parsed.success && parsed.data.slug === entry.dir) posts.push(parsed.data);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || b.issue - a.issue);
}

export function getPost(slug: string): PostMeta | null {
  return listPosts().find((p) => p.slug === slug) ?? null;
}

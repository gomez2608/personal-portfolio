import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listPosts } from "@/lib/blog/posts";
import { formatDateEs } from "@/lib/blog/format";
import { blogOpenGraph } from "@/lib/blog/metadata";
import { deploymentEnv, isPostVisible } from "@/lib/blog/visibility";

const description = "Investigación reciente en IA, explicada en simple.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: blogOpenGraph({ title: "Blog", description, url: "/blog" }),
};

export default function BlogPage() {
  const env = deploymentEnv();
  const posts = listPosts().filter((p) => isPostVisible(p, env));

  return (
    <main className="mx-auto w-full max-w-[1120px] px-[clamp(16px,4vw,40px)] pt-14 pb-24">
      <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] leading-none font-extrabold tracking-[-.03em] text-ink">
        Blog
      </h1>
      <p className="mt-4 text-lg text-slate">{description}</p>

      {posts.length === 0 ? (
        <p className="mt-14 text-graphite">Pronto: la primera edición está en camino.</p>
      ) : (
        <ul className="mt-12 grid gap-10">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid items-center gap-6 md:grid-cols-[minmax(0,360px)_1fr]"
              >
                <Image
                  src={`/blog/og/${post.slug}`}
                  alt=""
                  width={1200}
                  height={630}
                  unoptimized
                  className="w-full rounded-xl border border-line"
                />
                <div>
                  <h2 className="text-2xl leading-tight font-bold text-ink group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-graphite">{post.hook}</p>
                  <p className="mt-3 font-mono text-xs tracking-[.06em] text-muted-text uppercase">
                    {formatDateEs(post.date)} · Edición {post.issue}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

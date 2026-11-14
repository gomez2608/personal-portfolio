import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostMetaSchema, type PostMeta } from "@/lib/blog/schema";
import { formatDateEs } from "@/lib/blog/format";
import { deploymentEnv, isPostVisible } from "@/lib/blog/visibility";
import { blogSocialMetadata } from "@/lib/blog/metadata";
import { isNewsletterConfigured } from "@/lib/newsletter/config";
import { NewsletterSignup } from "./newsletter-signup";

/** Parses the raw post.json import; a broken file throws and fails the build. */
function parsePost(post: unknown): PostMeta {
  return PostMetaSchema.parse(post);
}

export function postMetadata(post: unknown): Metadata {
  const meta = parsePost(post);
  return {
    title: meta.title,
    description: meta.hook,
    ...blogSocialMetadata({
      title: meta.title,
      description: meta.hook,
      path: `/blog/${meta.slug}`,
      image: `/blog/og/${meta.slug}`,
      imageAlt: meta.title,
      publishedTime: meta.date,
    }),
    ...(meta.status === "draft" ? { robots: { index: false, follow: false } } : {}),
  };
}

function formatAuthors(authors: string[]): string {
  return authors.length > 3 ? `${authors.slice(0, 3).join(", ")} et al.` : authors.join(", ");
}

export function PostShell({ post, children }: { post: unknown; children: ReactNode }) {
  const meta = parsePost(post);
  if (!isPostVisible(meta, deploymentEnv())) notFound();

  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto w-full max-w-[68ch] px-[clamp(16px,4vw,40px)] pt-12 pb-24 focus:outline-none"
    >
      {meta.status === "draft" ? (
        <p
          role="note"
          className="mb-8 rounded-lg border border-dashed border-line bg-fog px-4 py-2 font-mono text-xs tracking-[.06em] text-graphite uppercase"
        >
          Borrador: no visible en producción
        </p>
      ) : null}
      <article>
        <header>
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] leading-[1.1] font-extrabold tracking-[-.02em] text-ink">
            {meta.title}
          </h1>
          <p className="mt-4 text-xl leading-snug text-slate">{meta.hook}</p>
          <p className="mt-5 font-mono text-xs tracking-[.06em] text-graphite uppercase">
            {formatDateEs(meta.date)} · Edición {meta.issue}
          </p>
        </header>
        <div className="mt-10">{children}</div>
        <aside aria-labelledby="fuente-title" className="mt-14 rounded-xl border border-line bg-card p-6">
          <h2 id="fuente-title" className="font-mono text-xs tracking-widest text-graphite uppercase">
            Fuente
          </h2>
          <p className="mt-3 text-base leading-snug font-semibold text-ink">
            <a
              href={meta.paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/60 decoration-2 underline-offset-4 hover:decoration-current"
            >
              {meta.paper.title}
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </p>
          <p className="mt-2 text-sm text-slate">
            {formatAuthors(meta.paper.authors)} · {meta.paper.published.slice(0, 4)}
          </p>
        </aside>
      </article>
      {isNewsletterConfigured() ? (
        <div className="mt-10">
          <NewsletterSignup source={meta.slug} />
        </div>
      ) : null}
    </main>
  );
}

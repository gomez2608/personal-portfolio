import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPost, listPosts } from "@/lib/blog/posts";
import { deploymentEnv, isPostVisible } from "@/lib/blog/visibility";

// post.json files are read from disk, and they aren't traced into a serverless function, so
// every card is rendered at build time and any other slug is a 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const env = deploymentEnv();
  return listPosts()
    .filter((p) => isPostVisible(p, env))
    .map((p) => ({ slug: p.slug }));
}

const PAPER = "#f7f5f0";
const INK = "#0f1220";
const SLATE = "#43465a";
const LINE = "#e4e0d6";
const TANGERINE = "#f07a2e";

// Brand fonts, bundled (woff) so the static build needs no network. Latin covers Spanish.
const font = (pkg: string, file: string) => fs.readFile(path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

/** The post's cover (clip 1's last frame, from `npm run blog:cover`) as a data URL, or null. */
async function readCover(slug: string): Promise<string | null> {
  try {
    const png = await fs.readFile(path.join(process.cwd(), "public", "blog", slug, "cover.png"));
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * The title as one flex item per word, so word spacing is even (Satori mis-measures Manrope's
 * kerned punctuation and leaves wide gaps); the gap between words is set explicitly.
 * `maxLines` caps the height; extra lines are clipped.
 */
function Title({ text, size, maxLines }: { text: string; size: number; maxLines: number }) {
  const lineHeight = 1.15;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: Math.round(size * 0.26),
        fontFamily: "Manrope",
        fontSize: size,
        fontWeight: 800,
        lineHeight,
        maxHeight: Math.ceil(size * lineHeight * maxLines),
        overflow: "hidden",
      }}
    >
      {text.split(/\s+/).map((w, i) => (
        // Commas as their own piece: Manrope kerns them under the previous letter ("r,"),
        // which Satori draws but doesn't measure, leaving a gap after the word. Colons are
        // fine attached (and gain a gap if split).
        <div key={i} style={{ display: "flex" }}>
          {(w.match(/[^,]+|,+/g) ?? [w]).map((part, j) => (
            <span key={j}>{part}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Meta({ issue }: { issue: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, background: TANGERINE }} />
      <div style={{ fontSize: 24, fontFamily: "DM Mono", color: SLATE }}>{`Edición ${issue} · sebastiangomezahumada.com/blog`}</div>
    </div>
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || !isPostVisible(post, deploymentEnv())) {
    return new Response("Not found", { status: 404 });
  }

  const [manrope, dmMono, cover] = await Promise.all([
    font("manrope", "manrope-latin-800-normal.woff"),
    font("dm-mono", "dm-mono-latin-400-normal.woff"),
    readCover(slug),
  ]);

  const card = cover ? (
    // Cover card: the clip's last frame, with the title under it.
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "30px 48px 26px" }}>
      <Meta issue={post.issue} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
        <img src={cover} width={720} height={405} alt="" style={{ borderRadius: 12, border: `2px solid ${LINE}` }} />
      </div>
      <div style={{ display: "flex", marginTop: 16 }}>
        <Title text={post.title} size={36} maxLines={2} />
      </div>
    </div>
  ) : (
    // Fallback: title only, same brand fonts.
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, color: INK, padding: 72 }}>
      <Meta issue={post.issue} />
      <Title text={post.title} size={post.title.length > 60 ? 56 : 68} maxLines={4} />
      <div style={{ display: "flex" }} />
    </div>
  );

  return new ImageResponse(card, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Manrope", data: manrope, weight: 800, style: "normal" },
      { name: "DM Mono", data: dmMono, weight: 400, style: "normal" },
    ],
  });
}

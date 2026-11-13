import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog/posts";
import { deploymentEnv, isPostVisible } from "@/lib/blog/visibility";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || !isPostVisible(post, deploymentEnv())) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f5f0",
          color: "#0f1220",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#f07a2e" }} />
          <div style={{ fontSize: 26, fontFamily: "monospace", color: "#43465a" }}>
            {`Edición ${post.issue}`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: post.title.length > 60 ? 56 : 68,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          {post.title}
        </div>
        <div style={{ display: "flex", fontSize: 26, fontFamily: "monospace", color: "#43465a" }}>
          sebastiangomezahumada.com/blog
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

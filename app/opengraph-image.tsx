import { ImageResponse } from "next/og";
import { site } from "@/app/data/site";

export const runtime = "edge";
export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b0b0c",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(104, 176, 171, 0.35), transparent 60%)",
          color: "#fafafa",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 24,
              letterSpacing: 4,
              color: "#68b0ab",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            {`${site.role} · ${site.location}`}
          </div>
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#a1a1aa",
              marginTop: 32,
              maxWidth: 900,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 20,
            color: "#71717a",
          }}
        >
          <div>sebastiangomez.me</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>linkedin / sebastiangahumada</span>
            <span>github / gomez2608</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

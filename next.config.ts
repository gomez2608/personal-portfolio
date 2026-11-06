import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/cv", destination: "/resume.pdf", permanent: false }];
  },
  async headers() {
    return [
      {
        // The CV lists references' contact details; keep it out of search results.
        source: "/resume.pdf",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        // Private mentorship dashboards: never index, never cache.
        source: "/mentoria/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;

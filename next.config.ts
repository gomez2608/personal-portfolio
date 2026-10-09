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
    ];
  },
};

export default nextConfig;

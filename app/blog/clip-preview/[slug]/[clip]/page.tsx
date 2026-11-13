import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deploymentEnv } from "@/lib/blog/visibility";
import { FrameView } from "./frame-view";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const PART_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Props = {
  params: Promise<{ slug: string; clip: string }>;
  searchParams: Promise<{ frame?: string | string[] }>;
};

/** Dev/preview only: renders one frame of one clip, no page chrome, for screenshots. */
export default async function ClipPreviewPage({ params, searchParams }: Props) {
  if (deploymentEnv() === "production") notFound();
  const { slug, clip } = await params;
  if (!PART_RE.test(slug) || !PART_RE.test(clip)) notFound();

  const raw = (await searchParams).frame;
  const parsed = Number.parseInt(Array.isArray(raw) ? raw[0] : (raw ?? "0"), 10);
  const frame = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

  return <FrameView slug={slug} clip={clip} frame={frame} />;
}

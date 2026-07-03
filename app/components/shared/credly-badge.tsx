"use client";

import { useEffect } from "react";

const EMBED_SRC = "https://cdn.credly.com/assets/utilities/embed.js";

type CredlyBadgeProps = {
  badgeId: string;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Renders a verified Credly badge.
 *
 * Credly ships an `embed.js` that scans the document for `data-share-badge-id`
 * divs and replaces each with an <iframe>. It runs that scan once, when it
 * executes — so we inject the script from a useEffect, after this component has
 * mounted, which guarantees the target div is already in the DOM.
 */
export function CredlyBadge({
  badgeId,
  width = 150,
  height = 270,
  className,
}: CredlyBadgeProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = EMBED_SRC;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div
      data-iframe-width={width}
      data-iframe-height={height}
      data-share-badge-id={badgeId}
      data-share-badge-host="https://www.credly.com"
      className={className}
    />
  );
}

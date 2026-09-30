"use client";

import { useEffect, useRef, useState } from "react";

const TANGERINE = "#F07A2E";
const LERP = 0.22;
const PULL_RADIUS = 90;
const PULL_STRENGTH = 0.85;
const SNAP_RADIUS = 34;
const NEAR_ATTR = "data-cursor-near";

/**
 * Tangerine dot cursor (fine pointers only). Grows into a ring over links/buttons and
 * is magnetically pulled onto the header logo dot, replacing it when close enough.
 */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const root = document.documentElement;
    const c = { x: -100, y: -100, tx: -100, ty: -100, big: false, show: false };
    let near = false;
    let raf = 0;
    let dot: Element | null = null;

    // The loop only runs while the cursor is catching up; it stops once settled.
    const start = () => {
      if (raf) return;
      dot = document.querySelector("[data-mark-dot]");
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      c.tx = e.clientX;
      c.ty = e.clientY;
      c.show = true;
      const target = e.target as Element | null;
      c.big = !!target?.closest?.("a, button, [role='button'], [data-hit]");
      start();
    };
    const onLeave = () => {
      c.show = false;
      start();
    };

    const loop = () => {
      let { tx, ty } = c;
      let nextNear = false;
      if (dot && c.show) {
        const r = dot.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(tx - cx, ty - cy);
        if (d < PULL_RADIUS) {
          const k = (1 - d / PULL_RADIUS) * PULL_STRENGTH;
          tx += (cx - tx) * k;
          ty += (cy - ty) * k;
          nextNear = d < SNAP_RADIUS;
        }
      }
      c.x += (tx - c.x) * LERP;
      c.y += (ty - c.y) * LERP;

      const big = c.big && !nextNear;
      const size = nextNear ? 9 : big ? 40 : 12;
      el.style.transform = `translate(${c.x}px,${c.y}px)`;
      el.style.opacity = c.show ? "1" : "0";
      el.style.width = el.style.height = `${size}px`;
      el.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
      el.style.background = big ? "transparent" : TANGERINE;

      if (nextNear !== near) {
        near = nextNear;
        root.toggleAttribute(NEAR_ATTR, near);
      }

      const settled = Math.abs(tx - c.x) < 0.1 && Math.abs(ty - c.y) < 0.1;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      root.removeAttribute(NEAR_ATTR);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[60] size-3 rounded-full border-2 border-tangerine bg-tangerine opacity-0"
      style={{
        margin: "-6px 0 0 -6px",
        transition:
          "width .25s, height .25s, margin .25s, background .25s, border-color .25s, opacity .3s",
      }}
    />
  );
}

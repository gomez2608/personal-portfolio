"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLang } from "@/app/components/providers/lang-provider";
import { careerChartEvents } from "@/app/data/content";

const TANGERINE = "#F07A2E";
const Y0 = 2018.8;
const Y1 = 2026.9;
const DRAW_IN_S = 2.4;

type Palette = {
  line: string;
  grid: string;
  fill: string;
  text: string;
  chipText: string;
  guide: string;
  font: string;
};

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const mono =
    getComputedStyle(document.body).getPropertyValue("--font-dm-mono").trim() ||
    "monospace";
  return {
    line: v("--navy"),
    grid: v("--grid"),
    fill: v("--card"),
    text: v("--graphite"),
    chipText: v("--bg"),
    guide: v("--chart-guide"),
    font: `400 11px ${mono}`,
  };
}

/** The "accuracy" curve: fast early gains, a little noise, flattening near 1. */
function accuracy(yr: number) {
  const u = (yr - Y0) / (Y1 - Y0);
  return (
    1 -
    (0.86 * Math.exp(-3 * u) +
      0.08 +
      0.035 * Math.sin(yr * 11) * Math.exp(-1.5 * u))
  );
}

export function AccuracyChart() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [announce, setAnnounce] = useState("");
  const mouse = useRef({ x: -1 });
  // Milestone picked with the arrow keys (-1 none); takes precedence over the mouse.
  const kbIndex = useRef(-1);
  const live = useRef({ events: careerChartEvents[lang], now: t.now, reduce });
  useEffect(() => {
    live.current = { events: careerChartEvents[lang], now: t.now, reduce };
  }, [lang, t.now, reduce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pal = readPalette();
    const themeObserver = new MutationObserver(() => (pal = readPalette()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let raf = 0;
    let t0: number | null = null;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (t0 === null) t0 = now;
      const { events, now: nowLabel, reduce } = live.current;
      const time = reduce ? DRAW_IN_S : (now - t0) / 1000;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w) return;
      if (canvas.width !== w * 2 || canvas.height !== h * 2) {
        canvas.width = w * 2;
        canvas.height = h * 2;
      }
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const L = 20,
        R = w - 20,
        T = 30,
        B = h - 34;
      const X = (yr: number) => L + ((yr - Y0) / (Y1 - Y0)) * (R - L);
      const Y = (v: number) => T + (1 - v) * (B - T);

      ctx.font = pal.font;
      ctx.lineWidth = 1;
      for (let yr = 2019; yr <= 2026; yr++) {
        ctx.strokeStyle = pal.grid;
        ctx.beginPath();
        ctx.moveTo(X(yr), T);
        ctx.lineTo(X(yr), B);
        ctx.stroke();
        ctx.fillStyle = pal.text;
        ctx.fillText("'" + String(yr).slice(2), X(yr) - 9, B + 20);
      }

      const progress = Math.min(1, time / DRAW_IN_S);
      const end = Y0 + (Y1 - Y0) * progress;
      ctx.strokeStyle = pal.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let yr = Y0; yr <= end; yr += 0.02) {
        const px = X(yr),
          py = Y(accuracy(yr));
        if (yr === Y0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      let near = kbIndex.current < events.length ? kbIndex.current : -1;
      if (near < 0 && mouse.current.x >= 0) {
        let best = Infinity;
        events.forEach(([yr], i) => {
          const d = Math.abs(X(yr) - mouse.current.x);
          if (d < best) {
            best = d;
            near = i;
          }
        });
      }

      events.forEach(([yr], i) => {
        if (yr > end) return;
        ctx.fillStyle = i === near ? pal.line : pal.fill;
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(X(yr), Y(accuracy(yr)), 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      if (near >= 0) {
        const [yr, label] = events[near];
        const px = X(yr),
          py = Y(accuracy(yr));
        ctx.strokeStyle = pal.guide;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py + 8);
        ctx.lineTo(px, B);
        ctx.stroke();
        ctx.setLineDash([]);
        const tw = ctx.measureText(label).width + 18;
        const bx = Math.min(Math.max(px - tw / 2, 4), w - tw - 4);
        const by = B - 26;
        ctx.fillStyle = pal.line;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, tw, 22, 6);
        else ctx.rect(bx, by, tw, 22);
        ctx.fill();
        ctx.fillStyle = pal.chipText;
        ctx.fillText(label, bx + 9, by + 15);
      } else if (progress >= 1) {
        const px = X(Y1 - 0.05),
          py = Y(accuracy(Y1 - 0.05));
        ctx.fillStyle = TANGERINE;
        ctx.beginPath();
        ctx.arc(
          px,
          py,
          5 + (reduce ? 0 : 1.5 * Math.sin(time * 4)),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = pal.text;
        ctx.fillText(nowLabel, px - 30, py + 18);
      }
    };

    // Only animate while on screen; the draw-in starts the first time it's seen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = entry.isIntersecting ? requestAnimationFrame(draw) : 0;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouse.current.x =
      ((e.clientX - r.left) * e.currentTarget.clientWidth) / r.width;
  };

  const events = careerChartEvents[lang];

  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const n = events.length;
    const cur = kbIndex.current;
    const next =
      e.key === "ArrowRight"
        ? (cur + 1) % n
        : e.key === "ArrowLeft"
          ? cur <= 0
            ? n - 1
            : cur - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    kbIndex.current = next;
    setAnnounce(`${Math.floor(events[next][0])}: ${events[next][1]}`);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex justify-between border-b border-line px-[18px] py-3.5 font-mono text-[11px] leading-none tracking-[.1em] text-graphite uppercase">
        <span id="chart-title">{t.chart}</span>
        <span aria-hidden="true">{t.hover}</span>
      </div>
      <canvas
        ref={canvasRef}
        onMouseMove={onMove}
        onMouseLeave={() => (mouse.current.x = -1)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => (kbIndex.current = -1)}
        role="img"
        aria-labelledby="chart-title"
        aria-describedby="chart-events"
        className="block h-[280px] w-full cursor-crosshair"
      />
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <ul id="chart-events" className="sr-only">
        {events.map(([yr, label]) => (
          <li key={label}>
            {Math.floor(yr)}: {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

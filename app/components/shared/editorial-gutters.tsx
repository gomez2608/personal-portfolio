"use client";

import { motion } from "framer-motion";

export function EditorialGutters() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block [writing-mode:vertical-rl]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 flex items-center gap-2">
          BOGOTÁ
          <span className="inline-block h-px w-3 bg-muted-foreground/40" />
          04°43′N · 74°05′W
        </p>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block [writing-mode:vertical-rl]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-brand animate-pulse" />
          NOW @ PROVECTUS
          <span className="inline-block h-px w-3 bg-muted-foreground/40" />
          AVAILABLE
        </p>
      </motion.div>
    </>
  );
}

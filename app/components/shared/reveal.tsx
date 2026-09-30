"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/** Scroll reveal: fades up 36px once, when 12% of the section is visible. */
export function Reveal({ children, ...props }: HTMLMotionProps<"section">) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

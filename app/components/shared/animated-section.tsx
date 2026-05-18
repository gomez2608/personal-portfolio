"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedSectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
  delay?: number;
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
};

export function AnimatedSection({ id, className, children, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      className={cn("scroll-mt-20 py-16 md:py-24", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
      custom={delay}
    >
      {children}
    </motion.section>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

"use client";

import { motion } from "framer-motion";
import { publications } from "@/app/data/publications";
import {
  AnimatedSection,
  staggerContainer,
  staggerItem,
} from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";
import { Tag } from "@/app/components/shared/tag";

export default function Publications() {
  return (
    <AnimatedSection id="publications">
      <SectionHeading eyebrow="WRITING" title="Publications" />
      <motion.ol
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {publications.map((pub, i) => (
          <motion.li
            key={i}
            variants={staggerItem}
            className="border-b border-border pb-6 last:border-0"
          >
            <p className="text-base text-foreground/90">
              {pub.link ? (
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors"
                >
                  {pub.citation}
                </a>
              ) : (
                pub.citation
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              {pub.venue}
            </p>
            {pub.status && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Tag>{pub.status}</Tag>
              </div>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </AnimatedSection>
  );
}

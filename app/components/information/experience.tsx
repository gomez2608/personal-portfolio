"use client";

import { motion } from "framer-motion";
import { experiences } from "@/app/data/experience";
import {
  AnimatedSection,
  staggerContainer,
  staggerItem,
} from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";
import { Tag } from "@/app/components/shared/tag";

export default function Experience() {
  return (
    <AnimatedSection id="experience">
      <SectionHeading eyebrow="WORK" title="Experience" />
      <motion.ol
        className="relative border-l border-border ml-2 space-y-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {experiences.map((exp, i) => (
          <motion.li key={i} variants={staggerItem} className="relative pl-6">
            <span className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-brand border-2 border-background" />
            {exp.date && (
              <p className="font-mono text-xs uppercase tracking-widest text-brand mb-1">
                {exp.date}
              </p>
            )}
            <h3 className="text-xl md:text-2xl font-semibold text-foreground">
              {exp.jobTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {exp.company}
              {exp.location ? ` · ${exp.location}` : ""}
            </p>
            <p className="text-base text-foreground/85 mt-4">
              {exp.jobDescription}
            </p>
            {exp.bp && exp.bp.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 mt-3 text-foreground/85">
                {exp.bp.map((point, idx) => (
                  <li key={idx} className="text-sm">
                    {point}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {exp.tools
                .split("·")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tool) => (
                  <Tag key={tool}>{tool}</Tag>
                ))}
            </div>
            {exp.contact && (
              <p className="font-mono text-xs text-muted mt-3">
                Reference: {exp.contact}
              </p>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </AnimatedSection>
  );
}

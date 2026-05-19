"use client";

import { motion } from "framer-motion";
import { educations } from "@/app/data/education";
import {
  AnimatedSection,
  staggerContainer,
  staggerItem,
} from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";
import { Tag } from "@/app/components/shared/tag";

export default function Education() {
  return (
    <AnimatedSection id="education">
      <SectionHeading eyebrow="STUDY" title="Education" />
      <motion.ol
        className="relative border-l border-border ml-2 space-y-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {educations.map((edu, i) => (
          <motion.li key={i} variants={staggerItem} className="relative pl-6">
            <span className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-brand border-2 border-background" />
            {edu.date && (
              <p className="font-mono text-xs uppercase tracking-widest text-brand mb-1">
                {edu.date}
              </p>
            )}
            <h3 className="text-xl md:text-2xl font-semibold text-foreground">
              {edu.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {edu.university}
              {edu.location ? ` · ${edu.location}` : ""}
            </p>
            {edu.thesis && (
              <p className="text-base text-foreground/85 mt-4">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mr-2">
                  Thesis
                </span>
                {edu.thesis}
              </p>
            )}
            <p className="text-base text-foreground/85 mt-4">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mr-2">
                Coursework
              </span>
              {edu.coursework}
            </p>
            {edu.GPA && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Tag>GPA {edu.GPA}</Tag>
              </div>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </AnimatedSection>
  );
}

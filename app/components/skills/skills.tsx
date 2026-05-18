"use client";

import { motion } from "framer-motion";
import {
  AnimatedSection,
  staggerContainer,
  staggerItem,
} from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";
import { Tag } from "@/app/components/shared/tag";
import { skills } from "@/app/data/skills";

export default function Skills() {
  return (
    <AnimatedSection id="skills">
      <SectionHeading eyebrow="STACK" title="Skills & tools" />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {skills.map((group) => (
          <motion.div key={group.group} variants={staggerItem}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-brand mb-3">
              {group.group}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatedSection>
  );
}

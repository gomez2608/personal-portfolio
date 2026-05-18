"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Github, ExternalLink, FileText } from "lucide-react";
import { projects, type Project } from "@/app/data/projects";
import {
  AnimatedSection,
  staggerContainer,
  staggerItem,
} from "@/app/components/shared/animated-section";
import { SectionHeading } from "@/app/components/shared/section-heading";
import { Tag } from "@/app/components/shared/tag";
import { TiltCard } from "@/app/components/shared/tilt-card";
import { Card } from "@/components/ui/card";

function ProjectCard({
  project,
  priority,
}: {
  project: Project;
  priority: boolean;
}) {
  return (
    <Card className="bg-background border-border p-0 overflow-hidden group transition-colors duration-200 hover:border-brand/40 h-full">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={project.image}
          alt={`Screenshot of ${project.title}`}
          fill
          priority={priority}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          {project.category}
        </p>
        <h3 className="text-xl font-semibold text-foreground">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground">{project.problem}</p>
        <p className="text-sm text-foreground/85">{project.approach}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {project.stack.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
        {(project.githubLink || project.liveLink || project.paperLink) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="text-muted-foreground hover:text-brand transition-colors inline-flex items-center gap-1 text-sm"
              >
                <Github className="size-4" /> Code
              </a>
            )}
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="text-muted-foreground hover:text-brand transition-colors inline-flex items-center gap-1 text-sm"
              >
                <ExternalLink className="size-4" /> Demo
              </a>
            )}
            {project.paperLink && (
              <a
                href={project.paperLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} paper`}
                className="text-muted-foreground hover:text-brand transition-colors inline-flex items-center gap-1 text-sm"
              >
                <FileText className="size-4" /> Paper
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Projects() {
  return (
    <AnimatedSection id="projects">
      <SectionHeading eyebrow="BUILT" title="Featured projects" />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {projects.map((p, i) => (
          <motion.div key={p.id} variants={staggerItem}>
            <TiltCard intensity={5} className="h-full">
              <ProjectCard project={p} priority={i === 0} />
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </AnimatedSection>
  );
}

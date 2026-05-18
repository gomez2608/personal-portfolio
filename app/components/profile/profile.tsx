"use client";

import { motion } from "framer-motion";
import { Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "../shared/magnetic";
import { site } from "../../data/site";

const REVEAL_BASE_DELAY = 0.1;
const LETTER_STAGGER = 0.03;
const NAME_DURATION = 0.7;

export default function Profile() {
  const eyebrow = `${site.role.toUpperCase()} · ${site.location.toUpperCase()}`;
  const words = site.name.split(" ");
  const totalLetters = site.name.replace(/\s/g, "").length;
  const nameRevealEnd =
    REVEAL_BASE_DELAY + totalLetters * LETTER_STAGGER + NAME_DURATION * 0.5;

  return (
    <section id="about" className="scroll-mt-20 pt-8 pb-16 md:pt-12 md:pb-24">
      <motion.p
        className="font-mono text-xs uppercase tracking-widest text-brand"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {eyebrow}
      </motion.p>

      <h1
        className="mt-4 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl"
        aria-label={site.name}
      >
        {words.map((word, wi) => {
          const charOffset = words
            .slice(0, wi)
            .reduce((sum, w) => sum + w.length, 0);
          return (
            <span key={wi}>
              <span className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, ci) => (
                  <motion.span
                    key={ci}
                    className="gradient-name inline-block"
                    initial={{ opacity: 0, filter: "blur(10px)", y: 18 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: NAME_DURATION,
                      delay:
                        REVEAL_BASE_DELAY + (charOffset + ci) * LETTER_STAGGER,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    aria-hidden
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
              {wi < words.length - 1 && " "}
            </span>
          );
        })}
      </h1>

      <motion.p
        className="mt-4 text-xl text-muted-foreground md:text-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: nameRevealEnd, ease: "easeOut" }}
      >
        {site.tagline}
      </motion.p>

      <motion.p
        className="mt-8 max-w-2xl text-base text-foreground/85"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: nameRevealEnd + 0.15,
          ease: "easeOut",
        }}
      >
        {site.bioParagraphs[0]}
      </motion.p>

      <motion.p
        className="mt-4 max-w-2xl text-base text-foreground/85"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: nameRevealEnd + 0.3,
          ease: "easeOut",
        }}
      >
        {site.bioParagraphs[1]}
      </motion.p>

      <motion.div
        className="mt-10 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: nameRevealEnd + 0.45,
          ease: "easeOut",
        }}
      >
        <Magnetic strength={0.3}>
          <Button asChild>
            <a
              href={site.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open resume in a new tab"
            >
              Résumé <Download />
            </a>
          </Button>
        </Magnetic>

        <Magnetic strength={0.3}>
          <Button asChild variant="outline">
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open LinkedIn profile in a new tab"
            >
              LinkedIn <ArrowUpRight />
            </a>
          </Button>
        </Magnetic>

        <Magnetic strength={0.3}>
          <Button asChild variant="outline">
            <a
              href={site.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open GitHub profile in a new tab"
            >
              GitHub <ArrowUpRight />
            </a>
          </Button>
        </Magnetic>
      </motion.div>
    </section>
  );
}

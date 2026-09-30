import content from "./content.json";

export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];

export type Copy = (typeof content.copy)["en"];
export type ProjectCopy = Copy["proj"][number];
export type ExperienceCopy = Copy["experience"][number];
export type EducationCopy = Copy["education"]["items"][number];
export type ContactFormCopy = Copy["contactForm"];
export type Certification = (typeof content.certifications)[number];
export type ChartEvent = [year: number, label: string];

export const copy: Record<Lang, Copy> = content.copy;
/** Tag lists per project, index-aligned with `copy[lang].proj`. */
export const projectTags: string[][] = content.projectTags;
/** Publications stay in English in both languages. */
export const publications: string[] = content.publications;
export const certifications: Certification[] = content.certifications;
export const careerChartEvents = content.careerChartEvents as Record<
  Lang,
  ChartEvent[]
>;
export const marqueeStack: string[] = content.marqueeStack;

/** Index of the MSc thesis project in `copy[lang].proj` (opened from Education). */
export const THESIS_PROJECT_INDEX = 0;

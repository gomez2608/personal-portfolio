import content from "./content.json";

export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];

export type Copy = (typeof content.copy)["en"];
export type ProjectCopy = Copy["proj"][number];
export type Certification = (typeof content.certifications)[number];
export type ChartEvent = [year: number, label: string];

export const copy: Record<Lang, Copy> = content.copy;
export const experienceTags: string[][] = content.experienceTags;
export const projectTags: string[][] = content.projectTags;
/** Publications stay in English in both languages. */
export const publications: string[] = content.publications;
export const certifications: Certification[] = content.certifications;
export const careerChartEvents = content.careerChartEvents as Record<Lang, ChartEvent[]>;
export const marqueeStack: string[] = content.marqueeStack;

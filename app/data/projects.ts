export type Project = {
  id: string;
  title: string;
  category: string;
  problem: string;
  approach: string;
  stack: string[];
  image: string;
  githubLink?: string;
  liveLink?: string;
  paperLink?: string;
};

export const projects: Project[] = [
  {
    id: "1",
    title: "Multimodal Colombian Sign Language",
    category: "Research · Multimodal ML",
    problem:
      "Identify the formational parameters of Colombian Sign Language (LSC) and differentiate the communicative characteristics between deaf signers and interpreters.",
    approach:
      "Collected and processed multimodal data; trained transformer-based video models (ViViT) on Hugging Face to classify signing parameters.",
    stack: ["Python", "TensorFlow", "Hugging Face", "ViViT"],
    image: "/project1.png",
  },
  {
    id: "2",
    title: "ML for Urological Disease Diagnosis",
    category: "Healthcare · Clinical ML",
    problem:
      "Improve accuracy and consistency in the diagnosis of urological diseases at Fundación Santa Fe de Bogotá.",
    approach:
      "Worked with clinical partners to build a supervised pipeline on de-identified patient data, validating against expert labels.",
    stack: ["Python", "scikit-learn", "Pandas", "NumPy"],
    image: "/project2.png",
  },
  {
    id: "3",
    title: "Personal Portfolio",
    category: "Web · Open source",
    problem: "Build a fast, accessible single-page portfolio that reflects the work, not the template.",
    approach:
      "Next.js 15 App Router with Tailwind v4, shadcn/ui primitives, Framer Motion reveals, and a strict dark palette. Deployed on Vercel.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind"],
    image: "/project3.png",
    githubLink: "https://github.com/gomez2608/personal-portfolio",
  },
];

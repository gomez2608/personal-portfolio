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
    title: "MSc Thesis: Colombian Sign Language Analysis",
    category: "Research · Multimodal ML",
    problem:
      "Recognize, classify, and biomechanically characterize Colombian Sign Language (LSC), and differentiate deaf signers from interpreters using a multi-perspective sensor stack.",
    approach:
      "Collected multimodal data from deaf signers and LSC interpreters via egocentric vision, conventional cameras, IMU, and EMG in static and conversational settings. Trained Random Forest, KNN, and Gradient Boosting on raw statistical, temporal, and spectral features, and fine-tuned a Video-Visual Transformer (ViViT) on raw video. Reached 95% accuracy on deaf-vs-interpreter classification and 40% accuracy on 50-sign recognition.",
    stack: ["Python", "PyTorch", "Hugging Face", "ViViT", "IMU", "EMG"],
    image: "/project1.jpg",
    githubLink: "https://github.com/gomez2608/lsc50-analysis",
  },
  {
    id: "2",
    title: "ML for Urological Disease Diagnosis",
    category: "Healthcare · Clinical ML",
    problem:
      "Identify and explain diagnostic disagreement among urologists at Fundación Santa Fe de Bogotá, and use the model to drive consensus.",
    approach:
      "Built decision-tree models to flag discrepancies in urologic disease diagnostics across clinicians and extracted feature importances to explain disagreement. Inter-clinician agreement improved from 50% to 75% after model-informed standardization sessions, with feature importance feeding directly into an improved diagnostic workflow.",
    stack: ["Python", "scikit-learn", "Pandas", "NumPy"],
    image: "/project2.png",
  },
  {
    id: "3",
    title: "Personal Portfolio",
    category: "Web · Open source",
    problem:
      "Build a fast, accessible single-page portfolio that reflects the work, not the template.",
    approach:
      "Next.js 15 App Router with Tailwind v4, shadcn/ui primitives, Framer Motion reveals, and a strict dark palette. Deployed on Vercel.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind"],
    image: "/project3.png",
    githubLink: "https://github.com/gomez2608/personal-portfolio",
  },
];

export type Publication = {
  citation: string;
  venue: string;
  status?: string;
  link?: string;
};

export const publications: Publication[] = [
  {
    citation:
      "Gomez S, et al. “Machine Learning Analysis of Colombian Sign Language: Recognition, Classification, and Biomechanical Characterization.”",
    venue: "Journal article",
    status: "Under review",
  },
  {
    citation:
      "Gomez S, et al. “AI-Based Platform for Automated Uroflowmetry Curve Morphology Classification.”",
    venue: "ICS-EUS 2025",
    status: "Conference abstract",
  },
  {
    citation:
      "Gomez S, et al. “Improving Uroflowmetry Interpretation: Effects of Standardization Sessions on Interobserver Agreement and AI Model Consistency.”",
    venue: "ICS-EUS 2025",
    status: "Conference abstract",
  },
];

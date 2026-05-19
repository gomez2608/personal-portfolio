export type Education = {
  name: string;
  date?: string;
  location?: string;
  university?: string;
  coursework: string;
  GPA: string;
  thesis?: string;
};

export const educations: Education[] = [
  {
    name: "MSc in Biomedical Engineering",
    date: "Aug 2023 — Dec 2025",
    location: "Bogotá, Colombia",
    university: "Universidad de los Andes",
    coursework:
      "Machine Learning for Engineering · Reinforcement Learning · Analysis & Processing of Medical Images",
    GPA: "4.78 / 5.00",
    thesis:
      "Machine Learning Analysis of Colombian Sign Language: Recognition, Classification, and Biomechanical Characterization.",
  },
  {
    name: "BSc in Biomedical Engineering — Minor in Neuroscience",
    date: "Jan 2019 — Dec 2022",
    location: "Bogotá, Colombia",
    university: "Universidad de los Andes",
    coursework:
      "Data Structures & Algorithms · Scientific Programming · Signal Processing · Neuroscience · Neuroanatomy",
    GPA: "4.08 / 5.00",
  },
];

export type Education = {
  name: string;
  date?: string;
  location?: string;
  university?: string;
  coursework: string;
  GPA: string;
};

export const educations: Education[] = [
  {
    name: "MSc in Biomedical Engineering",
    date: "Aug 2023 — Dec 2025",
    location: "Bogotá, Colombia",
    university: "Universidad de los Andes",
    coursework: "Machine Learning for Engineering · Reinforcement Learning · Advanced Physiology",
    GPA: "4.74 / 5.00",
  },
  {
    name: "BSc in Biomedical Engineering",
    date: "Jan 2019 — Jun 2023",
    location: "Bogotá, Colombia",
    university: "Universidad de los Andes",
    coursework: "Data Structures & Algorithms · Scientific Programming · Signal Processing",
    GPA: "4.08 / 5.00",
  },
];

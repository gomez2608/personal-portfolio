export type Experience = {
  jobTitle: string;
  date?: string;
  location?: string;
  company?: string;
  jobDescription: string;
  bp?: string[];
  tools: string;
  contact: string;
};

export type Education = {
  name: string;
  date?: string;
  location?: string;
  university?: string;
  coursework: string;
  GPA: string;
};

export type Certification = {
  name: string;
  date?: string;
  university?: string;
  hyperlink: string;
};

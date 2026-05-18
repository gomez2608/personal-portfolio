export type Certification = {
  name: string;
  date?: string;
  issuer?: string;
  hyperlink: string;
};

export const certifications: Certification[] = [
  {
    name: "AWS Certified Machine Learning Engineer — Associate",
    date: "Jan 2026",
    issuer: "Amazon Web Services",
    hyperlink: "https://cp.certmetrics.com/amazon/en/public/verify/credential",
  },
  {
    name: "AWS Cloud Practitioner Essentials",
    date: "Jul 2025",
    issuer: "Amazon Web Services",
    hyperlink: "",
  },
  {
    name: "Rapid Application Development with Large Language Models (LLMs)",
    date: "May 2025",
    issuer: "NVIDIA",
    hyperlink: "https://learn.nvidia.com/certificates?id=D-o2oirlQz25AXCr9g9mcw",
  },
  {
    name: "Efficient Large Language Model (LLM) Customization",
    date: "May 2025",
    issuer: "NVIDIA",
    hyperlink: "https://learn.nvidia.com/certificates?id=nfV2qnetSD6sKrmFeM2GUA",
  },
  {
    name: "Building LLM Applications with Prompt Engineering",
    date: "Apr 2025",
    issuer: "NVIDIA",
    hyperlink: "https://learn.nvidia.com/certificates?id=Pd9DuVAGTJKU6lImYx9R3w",
  },
  {
    name: "Deep Learning with PyTorch: Generative Adversarial Networks (GANs)",
    date: "May 2025",
    issuer: "Coursera",
    hyperlink: "https://www.coursera.org/account/accomplishments/certificate/JLBFEBA3Z44S",
  },
  {
    name: "Generative AI with Diffusion Models",
    date: "Oct 2024",
    issuer: "NVIDIA",
    hyperlink: "https://learn.nvidia.com/certificates?id=d7xra-f0RfybbNSlcaaAsQ",
  },
  {
    name: "Building Transformer-Based Natural Language Processing (NLP) Applications",
    date: "Nov 2023",
    issuer: "NVIDIA",
    hyperlink: "https://learn.nvidia.com/certificates?id=unwxzmZ7SB-LIWr2qnYZFA",
  },
  {
    name: "Django For Everybody Specialization",
    date: "Apr 2023",
    issuer: "University of Michigan",
    hyperlink: "https://www.coursera.org/account/accomplishments/specialization/certificate/SP4FDTPSFER3",
  },
];

export const site = {
  name: "Sebastian Gomez",
  initials: "SGA",
  role: "ML Engineer",
  location: "Bogotá, Colombia",
  tagline: "Building production GenAI on AWS.",
  bioParagraphs: [
    "Biomedical engineer turned ML engineer. Currently at Provectus building agentic AI workflows and fine-tuning LLMs on AWS Bedrock and SageMaker. MSc in Biomedical Engineering at Universidad de los Andes.",
    "Background spans YC-backed startups (JustPaid) and academic research. Stack centers on LangChain, PyTorch, and AWS. Open to ML roles at venture-backed companies.",
  ],
  email: "sebastiangomezahumada@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/sebastiangahumada/",
    github: "https://github.com/gomez2608",
    githubRepo: "https://github.com/gomez2608/personal-portfolio",
  },
  // To switch to a local PDF: replace this URL with "/resume.pdf" and drop the file in public/resume.pdf.
  // The current Drive link is preferable if you want to update the resume without a redeploy
  // (just upload a new version to the same Drive file).
  resumeUrl: "https://drive.google.com/file/d/1y4DwXXMEtS53ffSWAPtWlLoviDsindbi/view?usp=sharing",
} as const;

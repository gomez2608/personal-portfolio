export const site = {
  name: "Sebastian Gomez",
  initials: "SGA",
  role: "ML Engineer",
  location: "Bogotá, Colombia",
  tagline: "Shipping production LLM, RAG, and agentic systems on AWS.",
  bioParagraphs: [
    "Machine Learning Engineer with hands-on experience shipping production LLM, RAG, and agentic systems on AWS for document-intensive enterprise pipelines. MSc in Biomedical Engineering with research on multimodal data collection, computer vision, and deep learning.",
    "Comfortable working end-to-end across ML backend, serverless infrastructure (AWS Lambda, Step Functions, SAM), and full-stack delivery. Focused on turning frontier AI methods — LLM evaluation, retrieval, and human-in-the-loop workflows — into reliable, observable, cost-aware production systems.",
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
  resumeUrl: "https://drive.google.com/file/d/1sa3znVpfnh6B6RhEkn6MJzLnO1rcfGlH/view?usp=sharing",
} as const;

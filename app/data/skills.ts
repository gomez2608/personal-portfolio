export type SkillGroup = {
  group: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  { group: "Languages",    items: ["Python", "TypeScript", "SQL"] },
  { group: "ML / DL",      items: ["PyTorch", "TensorFlow", "Hugging Face", "scikit-learn"] },
  { group: "GenAI",        items: ["LangChain", "LangGraph", "LlamaIndex", "Instructor", "LiteLLM", "MLflow"] },
  { group: "Cloud / MLOps",items: ["AWS Bedrock", "AWS SageMaker", "Lambda", "Docker", "S3"] },
  { group: "Data",         items: ["NumPy", "Pandas", "Pydantic"] },
  { group: "Web",          items: ["React", "Next.js", "Tailwind"] },
];

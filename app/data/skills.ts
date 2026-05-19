export type SkillGroup = {
  group: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    group: "Programming",
    items: ["Python", "TypeScript", "JavaScript", "R", "SQL", "Bash"],
  },
  {
    group: "ML & AI",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "LLM fine-tuning & evaluation",
      "RAG",
      "LangGraph",
      "LlamaIndex",
      "DSPy",
      "Computer Vision",
      "NLP",
      "Signal & medical-image processing",
    ],
  },
  {
    group: "MLOps & Cloud",
    items: [
      "AWS Lambda",
      "Step Functions",
      "SAM",
      "Bedrock",
      "SageMaker",
      "Textract",
      "S3",
      "DynamoDB",
      "IAM",
      "MLflow",
      "Docker",
      "GitLab CI",
    ],
  },
  {
    group: "Data & Backend",
    items: ["PostgreSQL", "pgvector", "Alembic", "Django", "Pandas", "NumPy", "Pydantic"],
  },
  {
    group: "Frontend",
    items: ["React", "TypeScript", "React Query", "Zustand", "Vitest"],
  },
  {
    group: "Languages",
    items: ["English (Advanced)", "Spanish (Native)"],
  },
];

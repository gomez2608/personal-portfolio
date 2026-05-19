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

export const experiences: Experience[] = [
  {
    jobTitle: "Machine Learning Engineer",
    date: "Jul 2025 — Present",
    location: "San Francisco, CA · Remote",
    company: "Provectus",
    jobDescription:
      "Delivering LLM-powered features end-to-end across the stack — Python ML backend, AWS serverless infrastructure, and React/TypeScript frontend — for enterprise document-processing platforms.",
    bp: [
      "Built production RAG-powered conversational assistants over structured extracted data using LangGraph, AWS Bedrock, and PostgreSQL with pgvector.",
      "Designed scalable serverless extraction pipelines on AWS Step Functions, Lambda, Textract, and S3, with Alembic-versioned PostgreSQL and full SAM-based infrastructure-as-code.",
      "Built model evaluation and optimization workflows with MLflow 3.4, DSPy-based LLM-as-judge, embedding-model benchmarking, and human-in-the-loop feedback loops.",
      "Owned end-to-end delivery across ML backend, serverless infra, and React/TypeScript frontend for document-intensive enterprise pipelines.",
    ],
    tools:
      "Python · AWS Lambda · Step Functions · SAM · Bedrock · SageMaker · Textract · S3 · DynamoDB · PostgreSQL (pgvector, Alembic) · MLflow · DSPy · LangGraph · Pydantic · React/TypeScript",
    contact: "",
  },
  {
    jobTitle: "Growth & Software Development Engineer",
    date: "Jul 2023 — Jun 2025",
    location: "San Francisco, CA · Remote",
    company: "JustPaid.ai (YC-W23)",
    jobDescription:
      "Part-time agentic AI and full-stack development. Designed and shipped agentic workflows that turn unstructured PDFs into validated, structured records inside the product.",
    bp: [
      "Designed and implemented agentic AI workflows for automated information extraction from unstructured documents (PDFs), including NLP-based text extraction, structured parsing into Pydantic models, and self-validation loops with agent-based quality supervision.",
      "Built end-to-end data pipelines integrating ML models with PostgreSQL databases — preprocessing, classification, and structured storage of extracted entities (customers, contracts, line items).",
    ],
    tools: "Python · LlamaIndex · LangGraph · Django · PostgreSQL",
    contact: "Daniel Kivatinos · daniel@kivatinos.com",
  },
  {
    jobTitle: "Teaching Assistant",
    date: "Aug 2023 — Jun 2025",
    location: "Bogotá, Colombia",
    company: "Universidad de los Andes",
    jobDescription:
      "Led laboratory sessions on machine learning fundamentals: optimization techniques, linear and logistic regression, analytical OLS solutions, hyperparameter tuning, and neural network architectures.",
    bp: [
      "Managed ~70 students per semester; authored lab resources and assessed student work.",
      "Average student rating: 4.90 / 5.00.",
    ],
    tools: "Python · R · scikit-learn · TensorFlow · PyTorch",
    contact: "Luis Felipe Giraldo Trujillo · lf.giraldo404@uniandes.edu.co",
  },
];

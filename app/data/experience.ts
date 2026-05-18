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
    date: "Oct 2025 — Present",
    location: "San Francisco, CA · Remote",
    company: "Provectus",
    jobDescription:
      "ML Engineer specializing in GenAI solutions, leveraging AWS services to build, optimize, and deploy production-ready LLM applications with a focus on agentic workflows and model fine-tuning.",
    bp: [
      "Optimize and benchmark state-of-the-art LLMs against production constraints.",
      "Evaluate and harden ML pipelines: data preprocessing, training, and rigorous performance analysis.",
      "Fine-tune expert models used inside agentic AI workflows.",
      "Deploy GenAI solutions to production using AWS Bedrock and SageMaker.",
    ],
    tools: "Python · AWS Bedrock · AWS SageMaker · MLflow · LiteLLM · Instructor",
    contact: "",
  },
  {
    jobTitle: "Machine Learning Intern (GenAI)",
    date: "Jul 2025 — Sep 2025",
    location: "San Francisco, CA · Remote",
    company: "Provectus",
    jobDescription:
      "ML internship at Provectus focused on Generative AI, building features powered by agentic workflows for intelligent data parsing and processing.",
    bp: [
      "Benchmarked LLMs and proposed selection criteria adopted by the team.",
      "Built evaluation harnesses for agentic AI workflows.",
      "Shipped fine-tuned task-specific models for downstream agents.",
    ],
    tools: "Python · AWS Bedrock · AWS SageMaker · MLflow · LiteLLM",
    contact: "",
  },
  {
    jobTitle: "Growth & Software Development Engineer",
    date: "Jul 2023 — May 2025",
    location: "San Francisco, CA · Remote",
    company: "JustPaid (YC-backed)",
    jobDescription:
      "Full-stack development of internal product features across a Django backend and a React frontend. Owned flag-based feature rollout, authentication, and an agentic contract-parsing pipeline.",
    bp: [
      "Built AI features leveraging agentic workflows for intelligent data parsing and structured DB entry.",
      "Designed and shipped an agentic pipeline that parses contracts from raw PDFs into Pydantic models (Customer, Contract, LineItem).",
      "Added a self-validation loop and agent-based decision system to ensure extraction accuracy.",
      "Persisted validated records into PostgreSQL via the Django ORM.",
      "Hardened the authentication workflow and added user-session telemetry (last login, last connected account).",
    ],
    tools: "Python · Django · NodeJS · LangChain · LangGraph · LlamaIndex · PostgreSQL",
    contact: "Daniel Kivatinos · daniel@kivatinos.com",
  },
  {
    jobTitle: "ML Graduate Teaching Assistant",
    date: "Aug 2023 — May 2025",
    location: "Bogotá, Colombia",
    company: "Universidad de los Andes",
    jobDescription:
      "Conducted laboratory sessions on machine learning fundamentals: optimization, linear and logistic regression, analytical solutions in OLS, hyperparameter tuning, and neural network architectures.",
    bp: [
      "Managed ~70 students per semester. Authored lab resources and assessed student work.",
      "Average student rating: 4.90 / 5.00.",
    ],
    tools: "Python · NumPy · Pandas · scikit-learn · PyTorch · TensorFlow",
    contact: "Luis Felipe Giraldo Trujillo · lf.giraldo404@uniandes.edu.co",
  },
  {
    jobTitle: "Consulting & Information Solutions Intern",
    date: "Jan 2023 — Jun 2023",
    location: "Bogotá, Colombia",
    company: "Roche",
    jobDescription:
      "Healthcare data analysis and clinical-process visualization for Roche Colombia.",
    bp: [
      "Built an automated reports & graphics generator for thyroid-patient statistical data.",
      "Translated clinical workflows (pathology and blood exams) into block diagrams used by hospital staff.",
    ],
    tools: "Python · Pandas · Power BI · SQL · Data Visualization",
    contact: "",
  },
];

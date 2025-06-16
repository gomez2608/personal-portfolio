
const experiences: { jobTitle:string; date?:string; location?:string; company?:string; jobDescription:string; bp?: string[]; tools:string; contact:string }[] = [
    {
        jobTitle: "Growth and Software Development Engineer",
        date: "July 2023 - May 2025",
        location: "San Francisco, California - Remote",
        company: "JustPaid",
        jobDescription: "Full stack development of internal features in both backend (Django) and frontend. I developed flag-based features for users to have access to more capabilities inside the platform. I enhanced the authentication workflow and added user sessions that store information about last connection and last connected account. I developed a suite for founders to have control over the access to the app information at all levels for each user.",
        bp: [
            "Built AI features leveraging agentic workflows for intelligent data parsing, processing, and structured database entry",
            "Designed and implemented an agentic pipeline for contract parsing from raw PDF inputs",
            "Assesses whether input documents contain sufficient data to generate a valid legal contract",
            "Uses LlamaIndex to extract relevant text content",
            "Parses extracted data into Pydantic models for Customer, Contract, and LineItem entities",
            "Integrated a self-validation loop and agent-based decision system to ensure extraction accuracy and data integrity",
            "Automatically creates and stores validated records in a PostgreSQL database via Django ORM"
        ],
        tools: "NodeJS, Django, LangChain, LangGraph, LlamaIndex",
        contact: "Daniel Kivatinos, daniel@kivatinos.com"
    },
    {
        jobTitle: "ML Graduate Teaching Assistant",
        date: "August 2023 - May 2025",
        location: "Bogotá, Colombia",
        company: "Universidad de los Andes",
        jobDescription: "Conducted laboratory sessions on machine learning fundamentals, covering optimization techniques, linear and logistic regression models, analytical solutions in Ordinary Least Squares (OLS), hyperparameter fine-tuning methodologies, and neural network architectures",
        bp: [
            "Managed approximately 70 students per semester. Responsible for laboratory resource creation and studentwork assessment.",
            "Grade given by students: 4.90/5.00"
        ],
        tools: "NodeJS, Django, LangChain, LangGraph, LlamaIndex.",
        contact: "Luis Felipe Giraldo Trujillo, lf.giraldo404@uniandes.edu.co"
    },
    {
        jobTitle: "Consulting and Information Solutions Intern",
        date: "January 2023 - June 2023",
        location: "Bogotá, Colombia",
        company: "Roche",
        jobDescription: "Analytical and detail-oriented Information Solutions Intern with hands-on experience at Roche Colombia, specializing in healthcare data analysis and clinical process visualization.",
        bp: [
            "Implemented an automatic reports and graphics generator for statistical information about thyroid ill patients.",
            "Represented workflows for patient exams (pathology and blood) in hospitals into easy-to-understand block diagrams."
        ],
        tools: "NodeJS, Django, LangChain, LangGraph, LlamaIndex.",
        contact: ""
    },
];

type ExperienceProps = {
    jobTitle: string,
    date?: string,
    location?: string,
    company?: string,
    jobDescription: string,
    bp?: string[],
    tools: string,
    contact: string
}

function ExperienceComponent({ data }: { data: ExperienceProps }) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row justify-between">
                <p className="font-medium font-inter text-beige text-2xl">{data.jobTitle}</p>
                <p className="font-medium font-inter text-white text-base">{data.date}</p>
            </div>
            <p className="text-solid-beige text-sm font-light"><strong>{data.company}</strong> | {data.location}</p>
            <p className="font-light text-base text-foreground w-5/6 max-md:w-full">{data.jobDescription}</p>
            <ol>
            {data.bp && data.bp.length > 0 && (
                <ul className="list-disc pl-5 font-light text-base text-foreground w-5/6 max-md:w-full">
                    {data.bp.map((point, index) => (
                        <li key={index} className="font-light">{point}</li>
                    ))}
                </ul>
            )}
            </ol>
            <div className="flex flex-row sm:px-8 px-2">
                <div className={"px-2 content-center"+ (data.contact === "" ? " w-full" : " w-1/2")}>
                    <p className="font-light text-base text-foreground text-center"><strong className="font-bold">Languages and Tools:</strong> {data.tools}</p>
                </div>
                    {data.contact === "" ? null : (
                        <div className="w-1/2 px-6 content-center border-l border-solid border-foreground">
                            <p className="font-light text-base text-foreground text-center">
                                <strong className="font-bold">Contact:</strong> {data.contact}
                            </p>
                        </div>
                    )}                 
            </div>

        </div>
    );
}

export default function Experience() {
    return (
        <div className="flex flex-col mt-10 gap-10">
            {experiences.map((experience, index) => (
                <ExperienceComponent 
                    key={index}
                    data={experience}
                />
            ))}

        </div>
    );
}


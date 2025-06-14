import { Link } from "lucide-react";

type CertificationProps = {
    name:string,
    date?:string,
    university?:string,
    hyperlink:string
}


const certifications: { name:string; date?:string; university?:string; hyperlink:string;}[] = [
    {
        name: "Rapid Application Development with Large Language Models (LLMs)",
        date: "May 2025",
        university: "Nvidia",
        hyperlink: ""
    },
    {
        name: "Efficient Large Language Model (LLM) Customization",
        date: "May 2025",
        university: "Nvidia",
        hyperlink: ""
    },
    {
        name: "Building LLM Applications with Prompt Engineering",
        date: "April 2025",
        university: "Nvidia",
        hyperlink: ""
    },
    {
        name: "Generative AI with Diffusion Models",
        date: "October 2024",
        university: "Nvidia",
        hyperlink: ""
    },
    {
        name: "Building Transformer-Based Natural Language Processing (NLP) Applications",
        date: "November 2023",
        university: "Nvidia",
        hyperlink: ""
    },
    {
        name: "Django For Everybody Specialization",
        date: "April 2023",
        university: "University of Michigan",
        hyperlink: ""
    },
    {
        name: "Deep Learning With Pytorch: Generative Adversarial Networks (GANs)",
        date: "May 2025",
        university: "Coursera",
        hyperlink: ""
    },
];

function CertificationComponent({ data }: { data: CertificationProps }) {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row max-lg:flex-col justify-between">
                <p className="font-inter font-medium font-beige text-xl">{data.name}</p>
                <p className="text-base font-light text-white">{data.date}</p>
            </div>
            <div className="flex flex-row justify-between">
                <p className="font-bold text-solid-beige text-sm">{data.university}</p>
                <Link 
                    className="text-white text-sm hover:underline"
                    onClick={() => window.open(data.hyperlink, '_blank')}/>
            </div>

        </div>
    );
}

export default function Certificates() {
    return(
        <div className="flex flex-col mt-10 gap-10">
            {certifications.map((certification, index) => (
                <CertificationComponent 
                    key={index}
                    data={certification}
                />
            ))}

        </div>
    );
}
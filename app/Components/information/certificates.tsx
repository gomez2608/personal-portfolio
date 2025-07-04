import { Link } from "lucide-react";
import { MoveRight } from "lucide-react";

type CertificationProps = {
    name:string,
    date?:string,
    university?:string,
    hyperlink:string
}

const certifications: { name:string; date?:string; university?:string; hyperlink:string;}[] = [
    {
        name: "AWS Cloud Practitioner Essentials",
        date: "Jul 2025",
        university: "Amazon Web Services (AWS)",
        hyperlink: ""
    },
    {
        name: "Rapid Application Development with Large Language Models (LLMs)",
        date: "May 2025",
        university: "Nvidia",
        hyperlink: "https://learn.nvidia.com/certificates?id=D-o2oirlQz25AXCr9g9mcw"
    },
    {
        name: "Efficient Large Language Model (LLM) Customization",
        date: "May 2025",
        university: "Nvidia",
        hyperlink: "https://learn.nvidia.com/certificates?id=nfV2qnetSD6sKrmFeM2GUA"
    },
    {
        name: "Building LLM Applications with Prompt Engineering",
        date: "April 2025",
        university: "Nvidia",
        hyperlink: "https://learn.nvidia.com/certificates?id=Pd9DuVAGTJKU6lImYx9R3w"
    },
    {
        name: "Generative AI with Diffusion Models",
        date: "October 2024",
        university: "Nvidia",
        hyperlink: "https://learn.nvidia.com/certificates?id=d7xra-f0RfybbNSlcaaAsQ"
    },
    {
        name: "Building Transformer-Based Natural Language Processing (NLP) Applications",
        date: "November 2023",
        university: "Nvidia",
        hyperlink: "https://learn.nvidia.com/certificates?id=unwxzmZ7SB-LIWr2qnYZFA"
    },
    {
        name: "Django For Everybody Specialization",
        date: "April 2023",
        university: "University of Michigan",
        hyperlink: "https://www.coursera.org/account/accomplishments/specialization/certificate/SP4FDTPSFER3"
    },
    {
        name: "Deep Learning With Pytorch: Generative Adversarial Networks (GANs)",
        date: "May 2025",
        university: "Coursera",
        hyperlink: "https://www.coursera.org/account/accomplishments/certificate/JLBFEBA3Z44S"
    },
];

function CertificationComponent({ data }: { data: CertificationProps }) {
    return (
        <div className="flex flex-col gap-5">
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

        <div 
        className="flex flex-row rounded-lg items-center justify-start gap-4"
         onClick={() => window.open("https://www.linkedin.com/in/sebastiangahumada/details/certifications/", '_blank')}
        >
            <p className="font-inter text-300 text-2xl text-solid-beige">See all my certifications</p>
            <MoveRight className="text-solid-beige"/>
        </div>

        </div>
    );
}
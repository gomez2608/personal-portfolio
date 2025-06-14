"use client";

import {
  Card,
} from "@/components/ui/card"
{/*import { GithubIcon, Link } from "lucide-react";*/}
import Image from "next/image";

type ProjectCardProps = {
    id: string;
    title: string;
    description: string;
    technologies: string;
}

function ProjectCard({ id, title, description, technologies}: ProjectCardProps) {
    return (
        <Card className="w-full bg-background text-solid-beige border-0">
            <div className="flex justify-center items-center w-full">
                <Image 
                src={"/project"+id+".png"} 
                alt={"Project image "+id} 
                width={700} 
                height={550}
                className="rounded-lg"
                />
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center pt-4 max-lg:gap-4">
                <p className="font-inter text-2xl font-light text-beige w-5/6 max-lg:w-full">
                    {title}
                </p>
                {/*<div className="flex flex-row gap-6">
                    <GithubIcon onClick={() => window.open(githublink, '_blank')} className="text-beige w-[24px]" />
                    <Link onClick={() => window.open(liveDemoLink, '_blank')} className="text-beige w-[24px]" />
                </div>*/}
            </div>
            <p className="font-inter font-light text-base text-white w-7/8">{description}</p>
            <p className="font-inter font-light text-sm text-solid-beige">{technologies}</p>
        </Card>
    );
}

const cards: { id:string; title:string; description:string; technologies:string }[] = [
    {
        id: "1",
        title: "Multimodal Collection and Analysis of Colombian Sign Language",
        description: "This research proposes the use of multimodal data combined with artificial intelligence algorithms to identify key formational parameters of Colombian Sign Language (LSC) and differentiate communicative characteristics between deaf people and interpreters.",
        technologies: "Python, Tensorflow, Hugging Face, ViVit",

    },
    {
        id: "2",
        title: "Development of a Machine Learning Algorithm to Support the Diagnosis of Urological Diseases at Fundación Santa Fe de Bogotá",
        description: "This project, in collaboration with Fundación Santa Fe de Bogotá, uses artificial intelligence to improve accuracy and consistency in the diagnosis of urological diseases.",
        technologies: "Python, Scikit-learn, Pandas, NumPy",

    },
    {
        id: "3",
        title: "Personal Portfolio",
        description: "This portfolio showcases my professional journey, including my projects, skills, and experiences in the field of biomedical engineering and artificial intelligence.",
        technologies: "Next.js, React, Tailwind CSS, TypeScript",

    },
]
 

export default function Projects() {
    return (
        <section id="projects" className="flex flex-col justify-center mt-25 border-t border-b border-solid border-foreground pt-10 pb-10">
            <h2 className="text-2xl font-normal text-solid-beige">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 my-10 gap-15">
                
                {cards.map((card) => (
                    <ProjectCard 
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        description={card.description}
                        technologies={card.technologies}
                    />
                ))}

            </div>
            
        </section>
    );
}
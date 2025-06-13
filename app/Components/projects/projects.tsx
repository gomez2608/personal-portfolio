"use client";

import {
  Card,
} from "@/components/ui/card"
import { GithubIcon, Link } from "lucide-react";
import Image from "next/image";

type ProjectCardProps = {
    id: string;
    title: string;
    description: string;
    technologies: string;
    githublink: string;
    liveDemoLink: string;
}

function ProjectCard({ id, title, description, technologies, githublink, liveDemoLink }: ProjectCardProps) {
    return (
        <Card className="w-full bg-background text-solid-beige border-0">
            <div className="flex justify-center items-center w-full">
                <Image 
                src={"/project"+id+".jpg"} 
                alt={"Project image "+id} 
                width={700} 
                height={550}
                />
            </div>
            <div className="flex flex-row justify-between items-center pt-4">
                <p className="font-inter text-2xl font-light text-beige">
                    {title}
                </p>
                <div className="flex flex-row gap-6">
                    <GithubIcon onClick={() => window.open(githublink, '_blank')} className="text-beige w-[24px]" />
                    <Link onClick={() => window.open(liveDemoLink, '_blank')} className="text-beige w-[24px]" />
                </div>
            </div>
            <p className="font-inter font-light text-base text-white w-7/8">{description}</p>
            <p className="font-inter font-light text-sm text-solid-beige">{technologies}</p>
        </Card>
    );
}

const cards: { id:string; title:string; description:string; technologies:string; githublink:string; liveDemoLink:string  }[] = [
    {
        id: "1",
        title: "Project One",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        technologies: "React, Next.js, Tailwind CSS",
        githublink: "",
        liveDemoLink: ""
    },
    {
        id: "2",
        title: "Project One",
        description: "This is a description of project one.",
        technologies: "React, Next.js, Tailwind CSS",
        githublink: "",
        liveDemoLink: ""
    }

]
 

export default function Projects() {
    return (
        <div className="flex flex-col justify-center mt-25 border-t border-b border-solid border-foreground pt-10 pb-30">
            <h2 className="text-2xl font-normal text-solid-beige">Featured Projects</h2>
            <div className="grid grid-cols-2 my-10 gap-15">
                
                {cards.map((card) => (
                    <ProjectCard 
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        description={card.description}
                        technologies={card.technologies}
                        githublink={card.githublink}
                        liveDemoLink={card.liveDemoLink}
                    />
                ))}

            </div>
            
        </div>
    );
}
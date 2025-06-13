"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
        <Card className="w-full mx-4 bg-background text-solid-beige border-0">
            <Image src={"/project"+id+".jpg"} alt={"Project image "+id} width={550} height={550}/>
            <div className="flex flex-row justify-between items-center px-6 pt-4">
                <p>
                    {title}
                </p>


            </div>
        </Card>
    );
}

const cards: { id:string; title:string; description:string; technologies:string; githublink:string; liveDemoLink:string  }[] = [
    {
        id: "1",
        title: "Project One",
        description: "This is a description of project one.",
        technologies: "React, Next.js, Tailwind CSS",
        githublink: "",
        liveDemoLink: ""
    }

]
 

export default function Projects() {
    return (
        <div className="flex flex-col justify-center mt-25 mx-[181px] border-t border-solid border-foreground pt-10">
            <h2 className="text-2xl font-normal text-solid-beige">Featured Projects</h2>
            <div className="grid grid-cols-2 my-10 gap-4">
                
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
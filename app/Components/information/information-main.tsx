"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Experience from "./experience";

export default function InformationMain() {
    return(
        <div className="flex flex-col justify-center mt-40 ">
            < InformationLinks />
            <Experience />


        </div>
    );
}

const components: { id:string; title:string; description:string }[] = [
    {
        id: "1",
        title: "Experience",
        description: "Explore my professional journey and skills."
    },
    {   
        id: "2",
        title: "Education",
        description: "View my professional experience and skills."
    },
    {
        id: "3",
        title: "Certificates",
        description: "Get in touch with me."
    }
];

function InformationLinks(){
    const [activeComponent, setActiveComponent] = useState("1");
    function handleComponentClick(id: string) {
        setActiveComponent(id);
    }
    return(
        <div className="flex items-center justify-between gap-1 w-1/2">
        {components.map((component) => (
                    <Button 
                    className={"font-inter text-text-white font-light text-lg bg-transparent w-1/3 " + (activeComponent === component.id ? "bg-accent" : "")}
                    id={component.id}
                    onClick={() => handleComponentClick(component.id)}
                    > 
                        {component.title}
                    </Button>

                    ))}    
        </div>
    );
}



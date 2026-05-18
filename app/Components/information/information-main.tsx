"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import type React from "react";
import Experience from "./experience";
import Education from "./education";
import Certificates from "./certificates";


const components: { id: string; title: string; description: string; information?: React.ReactNode }[] = [
    {
        id: "1",
        title: "Experience",
        description: "Explore my professional journey and skills.",
        information: <Experience />
    },
    {
        id: "2",
        title: "Education",
        description: "View my professional experience and skills.",
        information: <Education />
    },
    {
        id: "3",
        title: "Certificates",
        description: "Get in touch with me.",
        information: <Certificates />
    }
];

function InformationLinks(){
    const [activeMenu, setActiveMenu] = useState("1");
    const [activeComponent, setActiveComponent] = useState<React.ReactNode>(components[0].information);
    function handleComponentClick(id: string) {
        setActiveMenu(id);
        setActiveComponent(components.find(component => component.id === id)?.information || <></>);
    }
    return(
        <>
        <h2 className="sr-only">About me</h2>
        <div role="tablist" aria-label="About sections" className="flex items-center justify-between gap-1 lg:w-1/2 md:w-full">
        {components.map((component) => {
            const isActive = activeMenu === component.id;
            return (
                <Button
                    key={component.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${component.id}`}
                    id={`tab-${component.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={"font-inter text-text-white font-light text-lg bg-transparent w-1/3 " + (isActive ? "bg-accent" : "")}
                    onClick={() => handleComponentClick(component.id)}
                >
                    {component.title}
                </Button>
            );
        })}
        </div>
        <div
            role="tabpanel"
            id={`panel-${activeMenu}`}
            aria-labelledby={`tab-${activeMenu}`}
        >
            {activeComponent}
        </div>
        </>
    );
}


export default function InformationMain() {
    return(
        <div className="flex flex-col justify-center max-lg:mt-20 mt-40 ">
            < InformationLinks />

        </div>
    );
}

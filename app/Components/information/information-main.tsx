"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Experience from "./experience";
import Education from "./education";
import Certificates from "./certificates";
import * as React from "react";

export default function InformationMain() {
    return(
        <div className="flex flex-col justify-center mt-40 ">
            < InformationLinks />

        </div>
    );
}

const components: { id: string; title: string; description: string; information?: React.JSX.Element }[] = [
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
    const [activeComponent, setActiveComponent] = useState(components[0].information);
    function handleComponentClick(id: string) {
        setActiveMenu(id);
        setActiveComponent(components.find(component => component.id === id)?.information || <></>);
    }
    return(
        <>
        <div className="flex items-center justify-between gap-1 lg:w-1/2 md:w-full">
        {components.map((component, index) => (
                    <Button 
                    key={index}
                    className={"font-inter text-text-white font-light text-lg bg-transparent w-1/3 " + (activeMenu === component.id ? "bg-accent" : "")}
                    id={component.id}
                    onClick={() => handleComponentClick(component.id)}
                    > 
                        {component.title}
                    </Button>

                    ))}    
        </div>
        {activeComponent}
        </>
    );
}



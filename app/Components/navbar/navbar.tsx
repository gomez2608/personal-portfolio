"use client";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuContent
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Menu } from "lucide-react";

const components: { title:string; href: string; description:string }[] = [
    {
        title: "Projects",
        href: "#projects",
        description: "Explore my projects and contributions."
    },
    {
        title: "Resume",
        href: "https://drive.google.com/file/d/1y4DwXXMEtS53ffSWAPtWlLoviDsindbi/view?usp=sharing",
        description: "View my professional experience and skills."
    },
    {
        title: "Contact",
        href: "#footer",
        description: "Get in touch with me."
    }
];

function CommonLinks(){
    return(
        <>
            <NavigationMenu className="flex items-center justify-between max-md:hidden max-md:w-0">
                <NavigationMenuList className="flex items-center justify-between w-[256px]">
                    {components.map((component, index) => (
                        <NavigationMenuItem key={index}>
                            <NavigationMenuLink asChild>
                                <Link
                                    href={component.href}
                                    {...(component.href.startsWith("http") ? { target: "_blank" as const, rel: "noopener noreferrer" } : {})}
                                    className="font-inter text-beige font-light text-lg"
                                >
                                    {component.title}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        ))}    
                </NavigationMenuList>   
            </NavigationMenu>
            <NavigationMenu className="md:hidden md:w-0 w-2/3  border border-1 border-beige rounded-lg" >
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger aria-label="Open menu">
                            <Menu className="text-beige"/>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className=" bg-background border border-1 border-beige rounded-lg">
                            {components.map((component, index) => (
                                <NavigationMenuLink
                                    href={component.href}
                                    key={index}
                                    {...(component.href.startsWith("http") ? { target: "_blank" as const, rel: "noopener noreferrer" } : {})}
                                    className="text-beige hover:text-beige"
                                >
                                {component.title}
                                </NavigationMenuLink>
                            ))}
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </>
    );
}
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between my-[40px] h-[123px]">
      <div className="text-2xl font-inter font-light text-beige ">SGA</div>
      <CommonLinks />
    </nav>
  );
}
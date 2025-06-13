"use client";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import Link from "next/link";


const components: { title:string; href: string; description:string }[] = [
    {
        title: "Projects",
        href: "#",
        description: "Explore my projects and contributions."
    },
    {
        title: "Resume",
        href: "#",
        description: "View my professional experience and skills."
    },
    {
        title: "Contact",
        href: "#",
        description: "Get in touch with me."
    }
];

function CommonLinks(){
    return(
        <NavigationMenu className="flex items-center justify-between sticky ">
            <NavigationMenuList className="flex items-center justify-between w-[265px]">
                {components.map((component) => (
                    <NavigationMenuItem key={component.title}>
                        <NavigationMenuLink>
                            <Link href={component.href} className="font-inter text-beige font-light text-lg">{component.title}</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    ))}    
            </NavigationMenuList>   
        </NavigationMenu>
    );
}
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between my-[40px] h-[123px]">
      <div className="text-2xl font-inter font-300 text-beige ">SGA</div>
      <CommonLinks />
    </nav>
  );
}
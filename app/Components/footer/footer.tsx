"use client";

import { Button } from '@/components/ui/button';
import { Mail, LinkedinIcon, Github } from 'lucide-react';


export default function Footer() {
    return (
        <footer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-20 justify-center">
            <Button 
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-5/6 h-[49px] items-center justify-self-center hover:bg-accent'
            onClick={() => window.location.href = 'mailto:sebastiangomezahumada@gmail.com'}
            >
                <Mail/> 
                Send an email
            </Button>
            <Button 
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-5/6 h-[49px] items-center justify-self-center hover:bg-accent'
            onClick={() => window.open('https://www.linkedin.com/in/sebastiangahumada/', '_blank')}
            >
                <LinkedinIcon/> 
                LinkedIn
            </Button>
            <Button 
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-5/6 h-[49px] items-center justify-self-center hover:bg-accent'
            onClick={() => window.open('https://github.com/gomez2608','_blank')}
            >
                <Github /> 
                GitHub
            </Button>
        </footer>
    );

}
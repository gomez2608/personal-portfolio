"use client";

import { MoveRight, Mail, LinkedinIcon, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Profile() {
    return(
        <section className="flex flex-col justify-items-start mt-[133px]">
            <p className="font-inter text-beige font-light text-base">Hello, I&apos;m</p>
            <h1 className="font-[Aleo] font-500 text-8xl bg-gradient-to-r from-green via-blue to-solid-beige bg-clip-text text-transparent my-[18px]">Sebastian Gomez</h1>
            <p className="font-inter text-beige text-justify font-light text-base">I&apos;m a software and AI engineer currently finishing a MSc in Biomedical Engineering with a research focus on ML applications, based in Bogotá, Colombia but with a lot of experience in working with multicultural and remote teams. My personal and professional interests include developing agentic AI workflows, NLP solutions, and ML models using LangChain, PyTorch and TensorFlow. With proven background developing impactful technical solutions at YC-backed startups, I&apos;m eager to bring my abilities to new venture-backed and innovative companies.</p>
            <div className="flex flex-row items-center justify-between mt-[40px]">
                <div className='flex flex-row max-lg:flex-col justify-between items-center gap-[10px] w-1/4'>
                    <p className="font-inter text-300 text-2xl text-solid-beige">Let&apos;s get in touch</p>
                    <MoveRight color='#bcbd8b'/>
                </div>
                <Networks />
            </div>
        </section>
    );
}

function Networks(){

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-center w-3/4 px-10'>
            <Button 
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-full h-[49px] items-center justify-self-center hover:bg-accent'
            onClick={() => window.location.href = 'mailto:sebastiangomezahumada@gmail.com'}
            >
                <Mail/> 
                <p className='max-lg:hidden'>Send an email</p>
            </Button>
            <Button 
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-full h-[49px] items-center justify-self-center hover:bg-accent'
            onClick={() => window.open('https://www.linkedin.com/in/sebastiangahumada/', '_blank')}
            >
                <LinkedinIcon/> 
                <p className='max-lg:hidden'>LinkedIn</p>
            </Button>
            <Button 
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-full h-[49px] items-center justify-self-center hover:bg-accent'
            onClick={() => window.open('https://github.com/gomez2608','_blank')}
            >
                <Github /> 
                <p className='max-lg:hidden'>GitHub</p>
            </Button>
        </div>
    );

}
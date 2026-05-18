import { Button } from '@/components/ui/button';
import { Mail, LinkedinIcon, Github } from 'lucide-react';


export default function Footer() {
    return (
        <footer id="footer" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-20 justify-center">
            <Button
            asChild
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-5/6 h-[49px] items-center justify-self-center hover:bg-accent'
            >
                <a href="mailto:sebastiangomezahumada@gmail.com" aria-label="Send an email">
                    <Mail/>
                    Send an email
                </a>
            </Button>
            <Button
            asChild
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-5/6 h-[49px] items-center justify-self-center hover:bg-accent'
            >
                <a href="https://www.linkedin.com/in/sebastiangahumada/" target="_blank" rel="noopener noreferrer" aria-label="Open LinkedIn profile in a new tab">
                    <LinkedinIcon/>
                    LinkedIn
                </a>
            </Button>
            <Button
            asChild
            className='bg-background border-1 border-buttonwhite text-buttonwhite w-5/6 h-[49px] items-center justify-self-center hover:bg-accent'
            >
                <a href="https://github.com/gomez2608" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile in a new tab">
                    <Github />
                    GitHub
                </a>
            </Button>
        </footer>
    );

}
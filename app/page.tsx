import IntroOverlay from "./components/intro/intro-overlay";
import CustomCursor from "./components/cursor/custom-cursor";
import Header from "./components/header/header";
import Hero from "./components/hero/hero";
import StackMarquee from "./components/marquee/stack-marquee";
import About from "./components/about/about";
import Work from "./components/work/work";
import { CaseStudyDrawer } from "./components/work/case-study-drawer";
import Talks from "./components/talks/talks";
import Education from "./components/education/education";
import Credentials from "./components/credentials/credentials";
import Footer from "./components/footer/footer";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only z-[70] rounded-lg bg-paper px-4 py-3 text-sm font-semibold text-hero focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <IntroOverlay />
      <CustomCursor />
      <Header />
      <Hero />
      <StackMarquee />
      <main className="mx-auto max-w-[1280px]">
        <About />
        <Work />
        <Talks />
        <Education />
        <Credentials />
      </main>
      <Footer />
      <CaseStudyDrawer />
    </>
  );
}

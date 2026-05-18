import Navbar from "./components/navbar/navbar";
import Profile from "./components/profile/profile";
import Skills from "./components/skills/skills";
import Experience from "./components/information/experience";
import Projects from "./components/projects/projects";
import Education from "./components/information/education";
import Certificates from "./components/information/certificates";
import Footer from "./components/footer/footer";
import { EditorialGutters } from "./components/shared/editorial-gutters";

export default function Home() {
  return (
    <>
      <Navbar />
      <EditorialGutters />
      <main className="max-w-5xl mx-auto px-6 md:px-8">
        <Profile />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Certificates />
        <Footer />
      </main>
    </>
  );
}

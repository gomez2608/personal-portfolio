import Navbar from "./Components/navbar/navbar";
import Profile from "./Components/profile/profile";
import InformationMain from "./Components/information/information-main";
import Projects from "./Components/projects/projects";
import Footer from "./Components/footer/footer";

export default function Home() {
  return (
    <main className="mx-[25px] sm:mx-[50px] md:mx-[100px] lg:mx-[181px] items-center justify-center">
      <Navbar />
      <Profile />
      <InformationMain />
      <Projects />
      <Footer />
    </main>
  );
}

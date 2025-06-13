import Navbar from "./Components/navbar/navbar";
import Profile from "./Components/profile/profile";
import InformationMain from "./Components/information/information-main";
import Projects from "./Components/projects/projects";
import Footer from "./Components/footer/footer";

export default function Home() {
  return (
    <div className="mx-[25px] lg:mx-[181px] md:mx-[100px] sm:mx-[50px] items-center justify-center">
      <Navbar />
      <Profile />
      <InformationMain />
      <Projects />
      <Footer />
    </div>
  );
}

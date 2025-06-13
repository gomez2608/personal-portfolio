import Navbar from "./Components/navbar/navbar";
import Profile from "./Components/profile/profile";
import InformationMain from "./Components/information/information-main";
import Projects from "./Components/projects/projects";
import Footer from "./Components/footer/footer";

export default function Home() {
  return (
    <div className="mx-[30px]  lg:mx-[181px] md:mx-[100px] sm:mx-[50px]">
      <Navbar />
      <Profile />
      <InformationMain />
      <Projects />
      <Footer />
    </div>
  );
}

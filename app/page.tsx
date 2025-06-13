import Navbar from "./Components/navbar/navbar";
import Profile from "./Components/profile/profile";
import InformationMain from "./Components/information/information-main";
import Projects from "./Components/projects/projects";
import Footer from "./Components/footer/footer";

export default function Home() {
  return (
    <div className="mx-[181px] max-lg:mx-1/6">
      <Navbar />
      <Profile />
      <InformationMain />
      <Projects />
      <Footer />
    </div>
  );
}

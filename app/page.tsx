import Navbar from "./Components/navbar/navbar";
import Profile from "./Components/profile/profile";
import InformationMain from "./Components/information/information-main";
import Projects from "./Components/projects/projects";

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <Profile />
      <InformationMain />
      <Projects />
    </div>
  );
}

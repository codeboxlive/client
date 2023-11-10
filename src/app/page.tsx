import { Metadata } from "next";
import { RootPageContainer } from "./RootPageContainer";
export const metadata: Metadata = {
  title: "Codebox Live",
  description: "Collaborative code sandbox for building Teams apps",
};

export default function ProjectsHome() {
  return (
    <div>
      <RootPageContainer />
    </div>
  );
}

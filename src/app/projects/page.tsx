import { Metadata } from "next";
import dynamic from "next/dynamic";

// Dynamically import the component that uses the navigator object
const ProjectsListContainer = dynamic(
  import("./ProjectsListContainer").then((mod) => mod.ProjectsListContainer),
  {
    ssr: false, // Disable server-side rendering
  }
);
const ProjectList = dynamic(
  import("@/components/project-list/ProjectList").then((mod) => mod.ProjectList),
  {
    ssr: false, // Disable server-side rendering
  }
);

export const metadata: Metadata = {
  title: "Codebox Live",
  description: "Collaborative code sandbox for building Teams apps",
};

export default function ProjectsHome() {
  return (
    <ProjectsListContainer>
      <ProjectList />
    </ProjectsListContainer>
  );
}

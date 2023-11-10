import { Metadata } from "next";
import { ProjectsListContainer } from "./ProjectsListContainer";
import { ProjectList } from "@/components/project-list/ProjectList";

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

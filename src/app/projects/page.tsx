import { ProjectList } from "@/components/project-list/ProjectList";
import { Metadata } from "next";
import { ProjectsListContainer } from "./ProjectsListContainer";

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

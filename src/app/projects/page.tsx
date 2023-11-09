import { ProjectList } from "@/components/project-list/ProjectList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Codebox Live",
  description: "Collaborative code sandbox for building Teams apps",
};

export default function ProjectsHome() {
  return <ProjectList />;
}

import { Metadata } from "next";
import { TeamsSettingsPageContainer } from "./TeamsSettingsPageContainer";

export const metadata: Metadata = {
  title: "Codebox Live",
  description: "Collaborative code sandbox for building Teams apps",
};

export default function ProjectsHome() {
  return <TeamsSettingsPageContainer />;
}

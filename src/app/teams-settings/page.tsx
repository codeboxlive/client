import { Metadata } from "next";
import { TeamsSettingsPageContainer } from "./TeamsSettingsPageContainer";

export const metadata: Metadata = {
  title: "Codebox Live - Tab Settings",
  description: "Tab settings for Codebox Live's Teams tab app",
};

export default function ProjectsHome() {
  return <TeamsSettingsPageContainer />;
}

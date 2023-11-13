import { Metadata } from "next";
import { TeamsAuthSuccessPageContainer } from "./TeamsAuthSuccessPageContainer";

export const metadata: Metadata = {
  title: "Codebox Live - Auth Success",
  description: "Auth success redirect",
};

export default function ProjectsHome() {
  return <TeamsAuthSuccessPageContainer />;
}

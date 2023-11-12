import { Metadata } from "next";
import { cookies } from "next/headers";
import { TeamsAuthSuccessPageContainer } from "./TeamsAuthSuccessPageContainer";

export const metadata: Metadata = {
  title: "Codebox Live - Auth Success",
  description: "Auth success redirect",
};

export default function ProjectsHome() {
  const cookieStore = cookies();
  const appSession = cookieStore.get("appSession")?.value;
  return <TeamsAuthSuccessPageContainer appSession={appSession} />;
}

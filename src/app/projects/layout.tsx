import type { Metadata } from "next";
import {
  getRecentProjects,
  getTemplates,
  getUserId,
  getUserProjects,
} from "@/api";
import { CodeboxLiveProvider } from "@/context-providers";
import { RootPageContainer } from "../RootPageContainer";
import { RequiresAuthError } from "@/models/errors";

export const metadata: Metadata = {
  title: "Codebox Live - Projects",
  description: "Collaborative code sandbox for building Teams apps",
};

async function getData() {
  const userId = await getUserId();
  const userProjects = await getUserProjects(userId);
  const recentProjects = await getRecentProjects(userId);
  const projectTemplates = await getTemplates(userId);
  return {
    userProjects,
    recentProjects,
    projectTemplates,
  };
}

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { userProjects, recentProjects, projectTemplates } = await getData();
    return (
      <CodeboxLiveProvider
        serverUserProjects={userProjects.projects}
        serverRecentProjects={recentProjects.projects}
        serverPinnedProjects={[]}
        serverProjectTemplates={projectTemplates}
      >
        {children}
      </CodeboxLiveProvider>
    );
  } catch (error: unknown) {
    if (error instanceof RequiresAuthError) {
      return <RootPageContainer />;
    }
    throw error;
  }
}

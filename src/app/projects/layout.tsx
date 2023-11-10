import type { Metadata } from "next";
import { getRecentProjects, getTemplates, getUserProjects } from "@/api";
import { CodeboxLiveProvider } from "@/context-providers";

export const metadata: Metadata = {
  title: "Codebox Live - Projects",
  description: "Collaborative code sandbox for building Teams apps",
};

async function getData() {
    const userProjects = await getUserProjects();
    const recentProjects = await getRecentProjects();
    const projectTemplates = await getTemplates();
    return {
        userProjects,
        recentProjects,
        projectTemplates,
    }
}

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    userProjects,
    recentProjects,
    projectTemplates
  } = await getData();
//   const [userProjects, recentProjects, projectTemplates] = await Promise.all([
//     userProjectsResponsePromise,
//     recentProjectsResponsePromise,
//     templatesPromise,
//   ]);
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
}

"use client";

import { createContext, FC, ReactNode, useCallback, useContext } from "react";
import { ICodeboxLiveContext, IProject, IProjectTemplate } from "@/models";
import { createAzureContainer } from "@/utils";
import { useTeamsClientContext } from "../teams-client-provider";
import { useCodeboxLiveProjects, GitFileProvider } from "./internals";

// React Context
const CodeboxLiveContext = createContext<ICodeboxLiveContext>(
  {} as ICodeboxLiveContext
);

// React useContext
export const useCodeboxLiveContext = (): ICodeboxLiveContext => {
  const context = useContext(CodeboxLiveContext);
  return context;
};

// React Context Provider
export const CodeboxLiveProvider: FC<{
  children: ReactNode;
  serverUserProjects: IProject[];
  serverRecentProjects: IProject[];
  serverPinnedProjects: IProject[];
  serverProjectTemplates: IProjectTemplate[];
}> = ({
  children,
  serverUserProjects,
  serverRecentProjects,
  serverPinnedProjects,
  serverProjectTemplates,
}) => {
  const {
    userProjects,
    recentProjects,
    pinnedProjects,
    currentProject,
    error,
    postProject,
    setProject,
    deleteProject,
    pinProjectToTeams,
    unpinProjectToTeams,
    setCurrentProjectId,
  } = useCodeboxLiveProjects(
    serverUserProjects,
    serverRecentProjects,
    serverPinnedProjects
  );
  const { teamsContext } = useTeamsClientContext();

  const createProject = useCallback(
    async (template: IProjectTemplate, customTitle?: string): Promise<void> => {
      try {
        console.log("CodeboxLiveProvider: creating from template", template);
        // Post initial project to get server-backed project ID
        // TODO: since posting without containerId, need to be able to add
        // container when opening project from list
        const postProjectResponse = await postProject({
          language: template.language,
          framework: template.framework,
          title: customTitle ?? template.title,
        });
        // Callback function to get initial code files from Git
        async function getInitialFiles(): Promise<Map<string, string>> {
          const provider = await GitFileProvider.create(
            postProjectResponse._id,
            template.gitRemoteUrl,
            template.branch
          );
          const files = await provider.getAllFiles();
          const filesMap = new Map<string, string>();
          files.forEach((file) => {
            const filePath = file.path.split("./").join("/");
            filesMap.set(filePath, file.content);
          });
          return filesMap;
        }
        // Create Fluid container
        const results = await createAzureContainer(
          teamsContext!.user!.id,
          getInitialFiles
        );
        // Update the newly created project with containerId
        // TODO: need to add retry logic in case this request fails
        await setProject({
          _id: postProjectResponse._id,
          containerId: results.containerId,
        });
        results.container.dispose();
        return Promise.resolve();
      } catch (error: any) {
        return Promise.reject(error);
      }
    },
    [teamsContext, postProject, setProject]
  );

  return (
    <CodeboxLiveContext.Provider
      value={{
        userProjects,
        recentProjects,
        pinnedProjects,
        currentProject,
        projectTemplates: serverProjectTemplates,
        error,
        createProject,
        setProject,
        deleteProject,
        pinProjectToTeams,
        unpinProjectToTeams,
        setCurrentProjectId,
      }}
    >
      {children}
    </CodeboxLiveContext.Provider>
  );
};

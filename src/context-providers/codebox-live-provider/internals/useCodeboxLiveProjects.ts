import { useCallback, useEffect, useRef, useState } from "react";
import { useStateRef } from "@/hooks";
import {
  IPostProject,
  IProject,
  ISetProject,
  isProjectResponse,
  isUserProjectsResponse,
} from "@/models";
// import { ProjectsService } from "../../../service";
import { useTeamsClientContext } from "../../teams-client-provider";

export function useCodeboxLiveProjects(
  serverUserProjects: IProject[],
  serverRecentProjects: IProject[],
  serverPinnedProjects: IProject[]
): {
  userProjects: IProject[];
  recentProjects: IProject[];
  pinnedProjects: IProject[];
  currentProject: IProject | undefined;
  error: Error | undefined;
  postProject: (projectData: IPostProject) => Promise<IProject>;
  setProject: (projectData: ISetProject) => Promise<IProject>;
  deleteProject: (project: IProject) => Promise<void>;
  pinProjectToTeams: (project: IProject, threadId: string) => Promise<void>;
  setCurrentProjectId: (value: string | undefined) => void;
} {
  const initializedRef = useRef(false);
  const projectsRef = useRef<Map<string, IProject>>(new Map());
  const [userProjectIds, userProjectIdsRef, setUserProjectIds] = useStateRef<
    string[]
  >([]);
  const [recentProjectIds, recentProjectIdsRef, setRecentProjectIds] =
    useStateRef<string[]>([]);
  const [pinnedProjectIds, pinnedProjectIdsRef, setPinnedProjectIds] =
    useStateRef<string[]>([]);
  const [currentProjectId, currentProjectIdRef, setCurrentProjectId] =
    useStateRef<string | undefined>(undefined);
  const loadingRef = useRef(true);
  const lastViewIdRef = useRef<string>();
  const [error, setError] = useState<Error>();

  const { teamsContext } = useTeamsClientContext();

  const postProject = useCallback(
    async (projectData: IPostProject): Promise<IProject> => {
      try {
        const projectResponse = await fetch("/api/projects/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        }).then((res) => res.json());
        if (!isProjectResponse(projectResponse)) {
          throw new Error(
            "useCodeboxLiveProjects.postProject: invalid response"
          );
        }
        // May want to uncomment if use case ever pops up
        // for creating a project without a container
        // const project = projectResponse.project;
        // setUserProjectIds([
        //   ...userProjectIdsRef.current.filter(
        //     (checkProjectId) => checkProjectId !== project._id
        //   ),
        //   project._id,
        // ]);
        return projectResponse.project;
      } catch (err: any) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("useCodeboxLiveClient: unable to process request");
      }
    },
    []
  );

  const pinProjectToTeams = useCallback(
    async (project: IProject, threadId: string) => {
      try {
        await fetch("/api/projects/teams/pinned/set", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: project._id,
            threadId: threadId,
          }),
        }).then((res) => res.json());
        setPinnedProjectIds([project._id, ...pinnedProjectIdsRef.current]);
      } catch (error: any) {
        console.error(error);
      }
    },
    [pinnedProjectIdsRef, setPinnedProjectIds]
  );

  const markProjectAsViewed = useCallback(
    async (project: IProject) => {
      try {
        await fetch("/api/projects/recent/set", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: project._id,
          }),
        }).then((res) => res.json());
      } catch (error) {
        console.error(error);
        // TODO: display error
      }
      setRecentProjectIds([
        project._id,
        ...recentProjectIdsRef.current.filter(
          (checkProjectId) => checkProjectId !== project._id
        ),
      ]);
    },
    [recentProjectIdsRef, setRecentProjectIds]
  );

  const setProject = useCallback(
    async (projectData: ISetProject): Promise<IProject> => {
      try {
        const projectResponse = await fetch("/api/projects/set", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        }).then((res) => res.json());
        if (!isProjectResponse(projectResponse)) {
          throw new Error(
            "useCodeboxLiveProjects.setProject: invalid response"
          );
        }
        const { project } = projectResponse;
        projectsRef.current.set(project._id, project);
        setUserProjectIds([
          project._id,
          ...userProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
        const threadId = teamsContext?.chat?.id || teamsContext?.channel?.id;
        if (threadId) {
          try {
            const pinPromise = pinProjectToTeams(project, threadId);
            const viewPromise = markProjectAsViewed(project);
            await Promise.all([pinPromise, viewPromise]);
          } catch (error) {
            console.error(error);
            // TODO: display error
          }
        } else {
          try {
            await markProjectAsViewed(project);
          } catch (error) {
            console.error(error);
            // TODO: display error
          }
        }
        return project;
      } catch (err: any) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("useCodeboxLiveClient: unable to process request");
      }
    },
    [
      setUserProjectIds,
      userProjectIdsRef,
      teamsContext?.chat?.id,
      teamsContext?.channel?.id,
      pinProjectToTeams,
      markProjectAsViewed,
    ]
  );

  const deleteProject = useCallback(
    async (project: IProject): Promise<void> => {
      await fetch("/api/projects/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project._id,
        }),
      }).then((res) => res.json());
      projectsRef.current.delete(project._id);
      if (userProjectIdsRef.current.length > 0) {
        setUserProjectIds([
          ...userProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
      }
      if (recentProjectIdsRef.current.length > 0) {
        setRecentProjectIds([
          ...recentProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
      }
      if (pinnedProjectIdsRef.current.length > 0) {
        setPinnedProjectIds([
          ...pinnedProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
      }
    },
    [
      pinnedProjectIdsRef,
      recentProjectIdsRef,
      setPinnedProjectIds,
      setRecentProjectIds,
      setUserProjectIds,
      userProjectIdsRef,
    ]
  );

  if (!initializedRef.current) {
    serverUserProjects.forEach((project) => {
      projectsRef.current.set(project._id, project);
    });
    serverRecentProjects.forEach((project) => {
      projectsRef.current.set(project._id, project);
    });
    serverPinnedProjects.forEach((project) => {
      projectsRef.current.set(project._id, project);
    });
    initializedRef.current = true;
  }

  // Get pinned items from teams
  const startedFetchingPinnedProjectsRef = useRef(false);
  useEffect(() => {
    if (startedFetchingPinnedProjectsRef.current || !teamsContext?.user?.id)
      return;
    initializedRef.current = true;
    // If in a chat or channel thread, get pinned projects
    const threadId: string | undefined =
      teamsContext.chat?.id || teamsContext.channel?.id;
    if (threadId) {
      fetch("/api/projects/teams/pinned/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (!isUserProjectsResponse(response)) {
            throw new Error("useCodeboxLiveProjects.useEffect: Invalid format");
          }
          const pinnedProjects = [...response.projects];
          pinnedProjects.forEach((pinnedProject) => {
            projectsRef.current.set(pinnedProject._id, pinnedProject);
          });
          setPinnedProjectIds(
            pinnedProjects.map((pinnedProject) => pinnedProject._id)
          );
        })
        .catch((err: any) => {
          console.error(err);
          if (err instanceof Error) {
            setError(err);
          } else {
            setError(
              new Error(
                "useCodeboxLiveProject: an unknown error occurred when getting user projects"
              )
            );
          }
        });
    }
    return () => {
      initializedRef.current = false;
    };
  }, [setPinnedProjectIds, teamsContext]);

  useEffect(() => {
    console.log("useCodeboxLiveProjects got projectId", currentProjectId);
    if (currentProjectId) {
      const refreshCurrentProject = async () => {
        let currentProject = projectsRef.current.get(currentProjectId);
        if (!currentProject) {
          const response = await fetch("/api/projects/get", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectId: currentProjectId,
            }),
          }).then((res) => res.json());
          if (!isProjectResponse(response)) {
            throw new Error(
              "useCodeboxLiveProjects.getProject: invalid response"
            );
          }
          currentProject = response.project;
        }
        if (currentProject && currentProject._id !== lastViewIdRef.current) {
          lastViewIdRef.current = currentProjectId;
          try {
            await fetch("/api/projects/recent/set", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                projectId: currentProjectId,
              }),
            }).then((res) => res.json());
          } catch (error) {
            console.error(error);
            lastViewIdRef.current = undefined;
            // TODO: display error
          }
          const newRecentProjectIds = [
            currentProjectId,
            ...recentProjectIdsRef.current.filter(
              (checkId) => checkId !== currentProjectId
            ),
          ];
          setRecentProjectIds(newRecentProjectIds);
        }
      };
      refreshCurrentProject();
    }
  }, [
    currentProjectId,
    currentProjectIdRef,
    recentProjectIdsRef,
    setCurrentProjectId,
    setRecentProjectIds,
  ]);

  const userProjects = userProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((project) => project !== undefined) as IProject[];
  const recentProjects = recentProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((project) => project !== undefined) as IProject[];
  const pinnedProjects = pinnedProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((project) => project !== undefined) as IProject[];
  let currentProject: IProject | undefined = currentProjectId
    ? projectsRef.current.get(currentProjectId)
    : undefined;

  return {
    userProjects,
    recentProjects,
    pinnedProjects,
    currentProject,
    error,
    postProject,
    setProject,
    deleteProject,
    pinProjectToTeams,
    setCurrentProjectId,
  };
}

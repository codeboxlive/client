import { FrameworkType, LanguageType } from "./Templates";

export interface IProjectProps {
  containerId?: string;
  title: string;
  language: LanguageType;
  framework: FrameworkType;
  createdAt: Date;
  createdById: string;
  lastUpdatedDate?: Date;
  lastUpdatedById?: string;
  sandboxContainerId?: string;
}

export interface IProject extends IProjectProps {
  _id: string;
}

export function isProject(value: any): value is IProject {
  return (
    value &&
    (typeof value.containerId === "string" ||
      value.containerId === undefined) &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.createdById === "string" &&
    (typeof value.lastUpdatedById === "string" ||
      value.lastUpdatedById === undefined) &&
    Object.values(FrameworkType).includes(value.framework) &&
    Object.values(LanguageType).includes(value.language)
  );
}

export interface IPostProject {
  title: string;
  language: LanguageType;
  framework: FrameworkType;
}

export function isPostProject(value: any): value is IPostProject {
  return (
    value &&
    value._id === undefined &&
    typeof value.title === "string" &&
    Object.values(LanguageType).includes(value.language) &&
    Object.values(FrameworkType).includes(value.framework)
  );
}

export interface ISetProject extends Partial<IProject> {
  _id: string;
}

export function isSetProject(value: any): value is ISetProject {
  const atLeastOneOf =
    [
      typeof value.title === "string",
      Object.values(LanguageType).includes(value.language),
      Object.values(FrameworkType).includes(value.framework),
      typeof value.containerId === "string",
      typeof value.createdById === "string",
      typeof value.sandboxContainerId === "string",
    ].filter((isTrue) => isTrue).length > 0;
  return value && atLeastOneOf && typeof value._id === "string";
}

export interface IUserProjectsResponse {
  projects: IProject[];
}

export function isUserProjectsResponse(
  value: any
): value is IUserProjectsResponse {
  if (value === undefined || value === null) return false;
  const projects = value.projects;
  if (projects instanceof Array) {
    if (projects.length === 0) return true;
    return projects
      .map((project: any) => isProject(project))
      .every((isProject) => isProject);
  }
  return false;
}

export interface IPostProjectResponse {
  project: IProject;
}

export function isProjectResponse(value: any): value is IPostProjectResponse {
  return value && isProject(value.project);
}

export interface IDeleteProject {
  projectId: string;
}

export function isDeleteProject(value: any): value is IDeleteProject {
  return value && typeof value.projectId === "string";
}

export interface IGetProject {
  projectId: string;
}

export function isGetProject(value: any): value is IGetProject {
  return value && typeof value.projectId === "string";
}

export interface IGetTeamsPinnedProjectsBody {
  threadId: string;
}

export function isGetTeamsPinnedProjectsBody(
  value: any
): value is IGetTeamsPinnedProjectsBody {
  return typeof value.threadId === "string";
}

export interface IPostTeamsPinnedProjectBody {
  threadId: string;
  projectId: string;
}

export function isPostTeamsPinnedProjectBody(
  value: any
): value is IPostTeamsPinnedProjectBody {
  return [
    typeof value.threadId === "string",
    typeof value.projectId === "string",
  ].every((val) => val);
}

export interface IPostRecentViewedProjectBody {
  projectId: string;
}

export function isPostRecentViewedProjectBody(
  value: any
): value is IPostTeamsPinnedProjectBody {
  return value && typeof value.projectId === "string";
}

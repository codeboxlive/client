"use client";

import {
  SelectTabEventHandler,
  Tab,
  TabList,
  Text,
  Title1,
} from "@fluentui/react-components";
import { FrameContexts } from "@microsoft/teams-js";
import { FC, useCallback, useState } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { LoadErrorWrapper } from "../view-wrappers";
import { CreateProjectActions } from "../create-project";
import { ProjectCard } from "./ProjectCard";
import { ScrollWrapper } from "../scroll-wrapper/ScrollWrapper";
import { TitledPageWrapper } from "../view-wrappers/titled-page-wrapper/TitledPageWrapper";

interface IProjectListProps {}

enum ProjectListTabType {
  recent = "Recent",
  owned = "Owned",
}

function isProjectListTabType(value: any): value is ProjectListTabType {
  return Object.values(ProjectListTabType).includes(value);
}

export const ProjectList: FC<IProjectListProps> = () => {
  const { teamsContext } = useTeamsClientContext();
  const threadId = teamsContext?.chat?.id || teamsContext?.channel?.id;
  const [selectedTab, setSelectedTab] = useState<ProjectListTabType>(
    ProjectListTabType.recent
  );
  const { recentProjects, userProjects, pinnedProjects, error } =
    useCodeboxLiveContext();

  const onTabSelect: SelectTabEventHandler = useCallback((ev, data) => {
    if (isProjectListTabType(data.value)) {
      setSelectedTab(data.value);
    }
  }, []);

  const relevantRecentProjects = !threadId
    ? recentProjects
    : recentProjects.filter(
        (project) =>
          !pinnedProjects.find((cProject) => cProject._id === project._id)
      );

  if (error) {
    return (
      <FlexColumn expand="fill" vAlign="center" hAlign="center">
        {error.message}
      </FlexColumn>
    );
  }

  return (
    <TitledPageWrapper title="Projects">
      <FlexItem noShrink>
        <FlexRow spaceBetween vAlign="center" wrap>
          <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
            <Tab value={ProjectListTabType.recent}>{"Recent"}</Tab>
            <Tab value={ProjectListTabType.owned}>{"Owned"}</Tab>
          </TabList>
          <CreateProjectActions />
        </FlexRow>
      </FlexItem>
      {selectedTab === ProjectListTabType.recent && (
        <>
          {recentProjects.length === 0 && pinnedProjects.length === 0 && (
            <FlexColumn>
              <Text>{"Create a project to get started"}</Text>
            </FlexColumn>
          )}
          {(recentProjects.length > 0 || pinnedProjects.length > 0) && (
            <FlexColumn expand="fill" marginSpacer="small">
              {!!threadId &&
                pinnedProjects.map((project) => {
                  return (
                    <ProjectCard
                      key={`pinned-project-${project._id}`}
                      project={project}
                      pinned
                    />
                  );
                })}
              {relevantRecentProjects.map((project) => {
                return (
                  <ProjectCard
                    key={`recent-project-${project._id}`}
                    project={project}
                  />
                );
              })}
            </FlexColumn>
          )}
        </>
      )}
      {selectedTab === ProjectListTabType.owned && (
        <>
          {userProjects.length === 0 && (
            <FlexColumn>
              <Text>{"Create a project to get started"}</Text>
            </FlexColumn>
          )}
          {userProjects.length > 0 && (
            <FlexColumn expand="fill" marginSpacer="small">
              {userProjects.map((project) => {
                return (
                  <ProjectCard
                    key={`owned-project-${project._id}`}
                    project={project}
                    pinned={
                      !!pinnedProjects.find(
                        (cProject) => cProject._id === project._id
                      )
                    }
                  />
                );
              })}
            </FlexColumn>
          )}
        </>
      )}
    </TitledPageWrapper>
  );
};

"use client";

import { FC, useCallback } from "react";
import {
  Button,
  mergeClasses,
  Text,
  Title3,
  tokens,
} from "@fluentui/react-components";
import { Card } from "@fluentui/react-components";
import { Pin20Regular } from "@fluentui/react-icons";
import { useTeamsClientContext } from "../../context-providers";
import { IProject } from "../../models";
import { FlexRow } from "../flex";
import { FrameContexts, meeting } from "@microsoft/teams-js";
import { getTextClampStyles } from "../../styles/getTextStyles";
import moment from "moment";
import { ProjectOverflowMenu } from "../menus/ProjectOverflowMenu";
import { ShareMenu } from "../menus";
import { inTeams } from "../../utils";
import { useRouter } from "next/navigation";

interface IProjectCardProps {
  project: IProject;
  pinned?: boolean;
}

export const ProjectCard: FC<IProjectCardProps> = ({ project, pinned }) => {
  const { teamsContext } = useTeamsClientContext();
  const { root: clampStyle, twoLines: twoLinesStyle } = getTextClampStyles();
  const router = useRouter();
  const isSidePanel =
    teamsContext?.page?.frameContext === FrameContexts.sidePanel;
  const selectText = isSidePanel ? "Code together" : "Open";

  const onOpen = useCallback(() => {
    router.push(`/projects/${project._id}?inTeams=${inTeams()}`);
  }, [router, project._id]);

  const onSelectProject = useCallback(() => {
    const isInTeams = inTeams();
    if (
      isInTeams &&
      teamsContext?.page?.frameContext === FrameContexts.sidePanel
    ) {
      meeting.shareAppContentToStage((error) => {
        console.error(error);
      }, `${window.location.origin}/projects/${project._id}?inTeams=true`);
    } else {
      onOpen();
    }
  }, [project, teamsContext, onOpen]);

  return (
    <Card
      appearance="filled"
      style={{
        width: "100%",
        marginBottom: "12px",
      }}
    >
      <FlexRow
        marginSpacer="small"
        vAlign="start"
        expand="horizontal"
        spaceBetween
      >
        <Title3
          align="start"
          className={mergeClasses(clampStyle, twoLinesStyle)}
        >
          {project.title}
        </Title3>
        {!!pinned && <Pin20Regular />}
      </FlexRow>
      <FlexRow marginSpacer="small" vAlign="center">
        <Text align="start" className={mergeClasses(clampStyle)}>
          {`${project.framework} ${project.language} • ${moment(
            project.createdAt
          ).fromNow()}`}
        </Text>
      </FlexRow>
      <FlexRow spaceBetween vAlign="center">
        <FlexRow vAlign="center" marginSpacer="smaller">
          <ShareMenu project={project} />
          <ProjectOverflowMenu
            project={project}
            onOpen={isSidePanel ? onOpen : undefined}
          />
        </FlexRow>
        <Button
          appearance="subtle"
          size="medium"
          onClick={onSelectProject}
          role="button"
          tabIndex={0}
          style={{
            color: tokens.colorBrandForeground1,
          }}
        >
          {selectText}
        </Button>
      </FlexRow>
    </Card>
  );
};

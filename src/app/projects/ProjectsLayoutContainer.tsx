"use client";

import { useTeamsClientContext } from "@/context-providers";
import { FlexColumn, FlexItem } from "@/components";
import { HomeNavigationBar } from "@/components/navigation-bar/HomeNavigationBar";
import { FrameContexts } from "@microsoft/teams-js";
import { FC, ReactNode } from "react";

interface IProjectsLayoutContainerProps {
  children?: ReactNode;
}

export const ProjectsLayoutContainer: FC<IProjectsLayoutContainerProps> = ({
  children,
}) => {
  const { teamsContext } = useTeamsClientContext();

  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;
  return (
    <FlexColumn expand="fill" vAlign="center" marginSpacer="small">
      {!isSidePanel && (
        <FlexItem noShrink>
          <HomeNavigationBar />
        </FlexItem>
      )}
      {children}
    </FlexColumn>
  );
};

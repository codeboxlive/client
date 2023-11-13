"use client";

import { useCodeboxLiveContext } from "@/context-providers/codebox-live-provider";
import { useTeamsClientContext } from "@/context-providers/teams-client-provider";
import { FlexColumn, FlexItem } from "@/components/flex";
import { HomeNavigationBar } from "@/components/navigation-bar/HomeNavigationBar";
import { FrameContexts } from "@microsoft/teams-js";
import { FC, ReactNode, useEffect } from "react";

interface IProjectsListContainerProps {
  children?: ReactNode;
}

export const ProjectsListContainer: FC<IProjectsListContainerProps> = ({
  children,
}) => {
  const { teamsContext } = useTeamsClientContext();
  const { setCurrentProjectId } = useCodeboxLiveContext();

  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;

  useEffect(() => {
    setCurrentProjectId(undefined);
    // Disable exhaustive deps because goal is to only set on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

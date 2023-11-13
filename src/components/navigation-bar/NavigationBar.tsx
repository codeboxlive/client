"use client";

import { FrameContexts } from "@microsoft/teams-js";
import { FC, ReactNode } from "react";
import { inTeams } from "../../utils";
import { FlexRow } from "../flex";
import { useRouter } from "next/navigation";
import { Home28Filled } from "@fluentui/react-icons";
import { Button, tokens } from "@fluentui/react-components";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";

interface INavigationBarProps {
  isL1: boolean;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
}

export const NavigationBar: FC<INavigationBarProps> = ({
  isL1,
  leftActions,
  rightActions,
}) => {
  const { setCurrentProjectId } = useCodeboxLiveContext();
  const { teamsContext } = useTeamsClientContext();
  const router = useRouter();
  return (
    <FlexRow
      expand="horizontal"
      spaceBetween
      marginSpacer="small"
      vAlign="center"
      hAlign="start"
      style={{
        borderBottomStyle: "solid",
        borderBottomColor: tokens.colorNeutralStroke1,
        borderBottomWidth: "1px",
        height: "44px",
      }}
    >
      <FlexRow
        vAlign="center"
        marginSpacer="small"
        style={{ paddingLeft: "8px" }}
      >
        {teamsContext?.page?.frameContext !== FrameContexts.meetingStage && (
          <>
            {isL1 && (
              <Button
                appearance="subtle"
                onClick={() => {
                  router.push(`/projects?inTeams=${inTeams()}`);
                }}
              >
                {"Codebox Live"}
              </Button>
            )}
            {!isL1 && (
              <Button
                icon={<Home28Filled />}
                appearance="subtle"
                onClick={() => {
                  setCurrentProjectId(undefined);
                  router.push(`/projects?inTeams=${inTeams()}`);
                }}
              />
            )}
          </>
        )}
        {leftActions || null}
      </FlexRow>
      <FlexRow
        vAlign="center"
        style={{ paddingRight: "8px" }}
        marginSpacer="smaller"
      >
        {rightActions}
      </FlexRow>
    </FlexRow>
  );
};

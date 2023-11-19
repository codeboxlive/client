"use client";

import { FrameContexts } from "@microsoft/teams-js";
import { FC, ReactNode } from "react";
import { inTeams } from "@/utils";
import { FlexRow } from "@/components/flex";
import { useRouter } from "next/navigation";
import { Home28Filled } from "@fluentui/react-icons";
import { Button, tokens, Image } from "@fluentui/react-components";
import { useTeamsClientContext } from "@/context-providers/teams-client-provider";
import Link from "next/link";

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
  const { teamsContext } = useTeamsClientContext();
  const router = useRouter();
  const IN_TEAMS = inTeams();
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
              <Link href={`/?inTeams=${IN_TEAMS}`} style={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}>
                <Image
                  src="/logo.svg"
                  alt="Codebox Live logo"
                  width={32}
                  height={32}
                />
              </Link>
            )}
            {!isL1 && (
              <Button
                icon={<Home28Filled />}
                appearance="subtle"
                onClick={() => {
                  router.push(`/projects?inTeams=${IN_TEAMS}`);
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

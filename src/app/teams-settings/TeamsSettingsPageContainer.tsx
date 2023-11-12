"use client";

import * as teamsJs from "@microsoft/teams-js";
import { useEffect, useState } from "react";
import { Title2, Subtitle2 } from "@fluentui/react-components";
import { FlexColumn } from "@/components/flex";
import { LoadErrorWrapper } from "@/components/view-wrappers";
import { inTeams } from "../../utils/inTeams";

export const TeamsSettingsPageContainer = () => {
  const [registered, setRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (registered) {
      return;
    }
    if (inTeams()) {
      setRegistered(true);
      teamsJs.pages.config.registerOnSaveHandler((saveEvent) => {
        teamsJs.pages.config.setConfig({
          suggestedDisplayName: "Codebox",
          contentUrl: `${window.location.origin}/?inTeams=true`,
        });
        saveEvent.notifySuccess();
      });
      teamsJs.pages.config.setValidityState(true);
    } else {
      setRegistered(true);
    }
  }, [registered, setRegistered]);

  return (
    <LoadErrorWrapper loading={!registered} error={undefined}>
      <FlexColumn
        expand="fill"
        vAlign="center"
        hAlign="center"
        marginSpacer="small"
      >
        <Title2 block align="center">
          {"Welcome to Codebox Live!"}
        </Title2>
        <Subtitle2 block align="center">
          {"Press the save button to continue."}
        </Subtitle2>
      </FlexColumn>
    </LoadErrorWrapper>
  );
};

"use client";

import { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTeamsClientContext } from "@/context-providers";
import { FrameContexts } from "@microsoft/teams-js";
import { FlexColumn, FlexItem, FlexRow } from "@/components/flex";
import { HomeNavigationBar } from "@/components/navigation-bar/HomeNavigationBar";
import { TitledPageWrapper } from "@/components/view-wrappers/titled-page-wrapper/TitledPageWrapper";
import { Button, Card, Subtitle1 } from "@fluentui/react-components";
import { FormTextField } from "@/components/form";
import { editBasicProfile } from "./actions";
import { FC } from "react";
import { useFormStatus } from "react-dom";
import { LoadWrapper } from "@/components/view-wrappers";

const Profile: NextPage = () => {
  const { user, isLoading } = useUser();
  const { teamsContext } = useTeamsClientContext();
  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;
  if (!user) return;
  const given_name = typeof user.given_name === "string" ? user.given_name : "";
  const family_name =
    typeof user.family_name === "string" ? user.family_name : "";
  // const phone_number =
  //   typeof user.phone_number === "string" ? user.phone_number : "";
  if (isLoading) {
    return <LoadWrapper text="Getting profile" />;
  }
  return (
    <FlexColumn expand="fill" vAlign="center" marginSpacer="small">
      {!isSidePanel && (
        <FlexItem noShrink>
          <HomeNavigationBar />
        </FlexItem>
      )}
      <TitledPageWrapper title="Profile">
        <Card
          appearance="filled"
          style={{
            width: "100%",
            marginBottom: "12px",
          }}
        >
          <Subtitle1>{"Basic information"}</Subtitle1>
          <form action={editBasicProfile}>
            <FlexColumn marginSpacer="small">
              <FormTextField
                id="given_name"
                label="Given name"
                defaultValue={given_name}
                placeholder="Enter given name..."
                type="text"
                required
              />
              <FormTextField
                id="family_name"
                label="Family name"
                defaultValue={family_name}
                placeholder="Enter family name..."
                type="text"
                required
              />
              {/* <FormTextField
                id="phone_number"
                label="Phone number"
                defaultValue={phone_number}
                placeholder="Enter phone number..."
                type="tel"
              /> */}
              <SubmitButton />
            </FlexColumn>
          </form>
        </Card>
      </TitledPageWrapper>
    </FlexColumn>
  );
};
Profile.displayName = "Profile";

const SubmitButton: FC = () => {
  const { pending } = useFormStatus();
  return (
    <FlexRow>
      <Button type="submit" appearance="primary" disabled={pending}>
        {"Update"}
      </Button>
    </FlexRow>
  );
};

export default Profile;

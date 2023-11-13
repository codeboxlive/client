"use client";

import { FlexColumn, FlexRow } from "@/components/flex";
import { LoadWrapper } from "@/components/view-wrappers";
import { inTeams, isSdkError } from "@/utils";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Subtitle1, Text, Title1 } from "@fluentui/react-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { authentication } from "@microsoft/teams-js";

export const RootPageContainer: FC = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | undefined>();

  useEffect(() => {
    if (!user) return;
    router.push("/projects");
  }, [user, router]);

  if (isLoading) {
    return <LoadWrapper text="Loading..." />;
  }

  const IN_TEAMS = inTeams();

  const authenticateViaTeams = async (path: string) => {
    try {
      const appSession = await authentication.authenticate({
        url: window.location.origin + path,
      });
      await fetch("/api/auth-set-session", {
        method: "GET",
        headers: {
          'Authorization': appSession,
        },
      });
      router.push("/projects");
    } catch (err: unknown) {
      if (isSdkError(err)) {
        setAuthError(
          `[${err.errorCode}] ${err.message ?? "An unknown error occurred"}`
        );
      } else if (err instanceof Error) {
        setAuthError(err.message);
      } else if (typeof err === "string") {
        setAuthError(err);
      } else {
        setAuthError("An unknown error occurred");
      }
    }
  };

  return (
    <FlexColumn expand="fill">
      <FlexColumn
        scroll
        style={{
          padding: "24px",
        }}
      >
        <FlexColumn marginSpacer="medium">
          <FlexColumn marginSpacer="small">
            <Title1>{"Welcome to Codebox Live"}</Title1>
            <Subtitle1>{"Please log in to continue"}</Subtitle1>
          </FlexColumn>
          <FlexRow marginSpacer="small">
            {!IN_TEAMS && (
              <>
                <Link href="/api/auth/signup">
                  <Button appearance="outline">{"Sign up"}</Button>
                </Link>
                <Link href="/api/auth/login">
                  <Button appearance="primary">{"Log in"}</Button>
                </Link>
              </>
            )}
            {IN_TEAMS && (
              <>
                <Button
                  appearance="outline"
                  onClick={() => {
                    authenticateViaTeams("/api/auth-teams/signup");
                  }}
                >
                  {"Sign up"}
                </Button>
                <Button
                  appearance="primary"
                  onClick={() => {
                    authenticateViaTeams("/api/auth-teams/login");
                  }}
                >
                  {"Log in"}
                </Button>
              </>
            )}
          </FlexRow>
          {!!authError && <Text>{authError}</Text>}
        </FlexColumn>
      </FlexColumn>
    </FlexColumn>
  );
};

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

interface IRootPageProps {
  /**
   * Redirect to path to override. If not set, uses current path.
   */
  redirectTo?: string;
}

export const RootPageContainer: FC<IRootPageProps> = ({ redirectTo }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | undefined>();

  useEffect(() => {
    if (!user) return;
    router.push(
      `${
        redirectTo ?? window.location.pathname + window.location.search
      }?inTeams=${inTeams()}`
    );
  }, [user, router, redirectTo]);

  if (isLoading) {
    return <LoadWrapper text="Attempting to log in..." />;
  }

  if (user) {
    return <LoadWrapper text={`Welcome back! Loading projects...`} />;
  }

  const IN_TEAMS = inTeams();
  const defaultRedirectTo = window.location.pathname + window.location.search;

  const authenticateViaTeams = async (path: "signup" | "login") => {
    try {
      await authentication.authenticate({
        url: window.location.origin + "/api/auth-teams/" + path,
      });
      router.push(`${redirectTo ?? defaultRedirectTo}?inTeams=true`);
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
                <Link
                  href={`/api/auth/signup?returnTo=${
                    redirectTo ?? defaultRedirectTo
                  }`}
                >
                  <Button appearance="outline">{"Sign up"}</Button>
                </Link>
                <Link
                  href={`/api/auth/login?returnTo=${
                    redirectTo ?? defaultRedirectTo
                  }`}
                >
                  <Button appearance="primary">{"Log in"}</Button>
                </Link>
              </>
            )}
            {IN_TEAMS && (
              <>
                <Button
                  appearance="outline"
                  onClick={() => {
                    authenticateViaTeams("signup");
                  }}
                >
                  {"Sign up"}
                </Button>
                <Button
                  appearance="primary"
                  onClick={() => {
                    authenticateViaTeams("login");
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

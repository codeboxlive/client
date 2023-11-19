"use client";

import { FlexColumn, FlexRow } from "@/components/flex";
import { LoadWrapper } from "@/components/view-wrappers";
import { inTeams, isSdkError } from "@/utils";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Subtitle1, Text, Title1 } from "@fluentui/react-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";
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
  const [awaitingSilentAuth, setAwaitingSilentAuth] = useState(inTeams());

  const setUnknownAuthError = useCallback(
    (err: unknown) => {
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
    },
    [setAuthError]
  );

  const defaultRedirectTo = window.location.pathname + window.location.search;

  const authenticateViaTeams = useCallback(
    async (path: "signup" | "login", connection?: "Microsoft-365-Tab-SSO") => {
      try {
        const url = new URL(window.location.origin + "/api/auth-teams/" + path);
        if (connection) {
          url.searchParams.set("connection", connection);
        }
        await authentication.authenticate({
          url: url.href,
        });
        router.push(`${redirectTo ?? defaultRedirectTo}?inTeams=true`);
      } catch (err: unknown) {
        setUnknownAuthError(err);
      }
    },
    [defaultRedirectTo, redirectTo, router, setUnknownAuthError]
  );

  const authenticateWithTeamsSSO = useCallback(
    async (silent: boolean) => {
      try {
        const token = await authentication.getAuthToken({
          silent,
        });
        const response = await fetch("/api/auth-ms/teams-sso", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await response.json();
        authenticateViaTeams("signup", "Microsoft-365-Tab-SSO");
      } catch (err: unknown) {
        let message: string = "An unknown error occurred";
        if (isSdkError(err) || err instanceof Error) {
          if (err.message) {
            message = err.message;
          }
        } else if (typeof err === "string") {
          message = err;
        }
        if (
          message &&
          ["FailedToOpenWindow", "CancelledByUser"].includes(message)
        ) {
          return;
        }
        setUnknownAuthError(err);
      }
    },
    [setUnknownAuthError, authenticateViaTeams]
  );

  useEffect(() => {
    if (!user) return;
    router.push(
      `${
        redirectTo ?? window.location.pathname + window.location.search
      }?inTeams=${inTeams()}`
    );
  }, [user, router, redirectTo]);

  useEffect(() => {
    if (isLoading) return;
    if (!inTeams()) return;
    if (user) return;
    authenticateWithTeamsSSO(true)
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setAwaitingSilentAuth(false);
      });
  }, [isLoading, user, authenticateWithTeamsSSO, setAwaitingSilentAuth]);

  if (isLoading) {
    return <LoadWrapper text="Attempting to log in..." />;
  }

  if (awaitingSilentAuth) {
    return (
      <LoadWrapper text="Attempting to log in with Microsoft EntraID..." />
    );
  }

  if (user) {
    return <LoadWrapper text={`Welcome back! Loading projects...`} />;
  }

  const IN_TEAMS = inTeams();

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
                <Button
                  appearance="primary"
                  onClick={() => {
                    authenticateWithTeamsSSO(false);
                  }}
                >
                  {"Log in with Microsoft"}
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

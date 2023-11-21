"use client";

import { FlexColumn, FlexRow } from "@/components/flex";
import { LoadWrapper } from "@/components/view-wrappers";
import { inTeams, isSdkError } from "@/utils";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Text,
  Title1,
  Image,
  tokens,
} from "@fluentui/react-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { authentication } from "@microsoft/teams-js";
import { useTeamsClientContext } from "@/context-providers";

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
  const [ssoManualAttemptActive, setSSOManualAttemptActive] = useState(false);
  const [loginActive, setLoginActive] = useState(false);
  const { teamsContext } = useTeamsClientContext();
  const mountedRef = useRef(true);

  const setUnknownAuthError = useCallback(
    (err: unknown, silent?: boolean) => {
      let prefix: string = "";
      let message: string = "An unknown error occurred";
      if (isSdkError(err)) {
        prefix = `[${err.errorCode}] `;
        message = err.message ?? "undefined";
      } else if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      if (["CancelledByUser", "resourceRequiresConsent"].includes(message)) {
        return;
      }
      if (message === "FailedToOpenWindow") {
        if (silent) return;
        message =
          "Browser blocked opening authentication page in a pop-out window. Ensure pop-out windows are enabled in your browser.";
      }
      setAuthError(prefix + message);
    },
    [setAuthError]
  );

  const defaultRedirectTo = window.location.pathname + window.location.search;

  const authenticateViaTeams = useCallback(
    async (
      path: "signup" | "login",
      connection?: "Microsoft-365-Tab-SSO",
      silent?: boolean
    ) => {
      setLoginActive(true);
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
        setUnknownAuthError(err, silent);
        setLoginActive(false);
      }
    },
    [defaultRedirectTo, redirectTo, router, setUnknownAuthError, setLoginActive]
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
        await authenticateViaTeams("signup", "Microsoft-365-Tab-SSO", silent);
      } catch (err: unknown) {
        setUnknownAuthError(err, silent);
      }
    },
    [setUnknownAuthError, authenticateViaTeams]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  const IN_TEAMS = inTeams();

  if (IN_TEAMS && !teamsContext) {
    return <LoadWrapper text="Waiting for app context..." />;
  }

  if (isLoading) {
    return <LoadWrapper text="Attempting to log in..." />;
  }

  if (user) {
    return <LoadWrapper text={`Welcome back! Loading projects...`} />;
  }

  if (awaitingSilentAuth) {
    return (
      <LoadWrapper text="Looking for existing account linked to your Microsoft EntraID..." />
    );
  }

  if (ssoManualAttemptActive) {
    return <LoadWrapper text="Logging in with Microsoft EntraID..." />;
  }

  if (loginActive) {
    return <LoadWrapper text="Logging in..." />
  }

  const upn = teamsContext?.user?.userPrincipalName;
  const ssoLayout = IN_TEAMS && !!upn;

  return (
    <FlexColumn expand="fill">
      <FlexColumn
        scroll
        style={{
          padding: "24px",
        }}
      >
        <FlexColumn marginSpacer="medium" hAlign="center">
          <Image
            src="/logo.svg"
            alt="Codebox Live logo"
            width={156}
            height={156}
          />
          <FlexColumn
            style={{
              width: "356px",
              padding: "32px",
              backgroundColor: tokens.colorNeutralBackground1,
              boxShadow: tokens.shadow8,
              borderRadius: tokens.borderRadiusXLarge,
            }}
            marginSpacer="medium"
            vAlign="center"
            hAlign="center"
          >
            <Title1 align="center">{"Sign in to start coding"}</Title1>
            {ssoLayout && (
              <>
                <FlexRow
                  spaceBetween
                  expand="horizontal"
                  vAlign="center"
                  marginSpacer="small"
                  style={{
                    borderRadius: tokens.borderRadiusLarge,
                    borderStyle: "solid",
                    borderWidth: tokens.strokeWidthThin,
                    borderColor: tokens.colorNeutralStroke1,
                    padding: "8px",
                  }}
                >
                  <Text weight="semibold">{upn}</Text>
                  <Button
                    appearance="primary"
                    onClick={() => {
                      setSSOManualAttemptActive(true);
                      authenticateWithTeamsSSO(false).finally(() => {
                        if (!mountedRef.current) return;
                        setSSOManualAttemptActive(false);
                      });
                    }}
                  >
                    {"Continue"}
                  </Button>
                </FlexRow>
              </>
            )}
            {!ssoLayout && (
              <FlexRow marginSpacer="small">
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
              </FlexRow>
            )}
            {!!authError && <Text>{authError}</Text>}
          </FlexColumn>
          {ssoLayout && (
            <FlexColumn vAlign="center" hAlign="center" marginSpacer="small">
              <Text>{`Not ${upn}?`}</Text>
              <FlexColumn hAlign="center">
                <Button
                  appearance="subtle"
                  onClick={() => {
                    authenticateViaTeams("login");
                  }}
                >
                  {"Log in with a different account"}
                </Button>
                <Text italic>{"OR"}</Text>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    authenticateViaTeams("signup");
                  }}
                >
                  {"Create new account"}
                </Button>
              </FlexColumn>
            </FlexColumn>
          )}
        </FlexColumn>
      </FlexColumn>
    </FlexColumn>
  );
};

"use client";
import { FC, useState, ReactNode } from "react";
import {
  FluentProvider,
  teamsLightTheme,
  tokens,
} from "@fluentui/react-components";
import { inTeams } from "@/utils";
import { TeamsClientProvider } from "@/context-providers";
import { AuthLayoutContainer } from "./AuthLayoutContainer";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export const RootLayoutContainer: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState(teamsLightTheme);
  return (
    <UserProvider>
      <FluentProvider
        theme={theme}
        style={{
          minHeight: "0px",
          position: "absolute",
          left: "0",
          right: "0",
          top: "0",
          bottom: "0",
          overflow: "hidden",
          backgroundColor: inTeams()
            ? "transparent"
            : tokens.colorNeutralBackground3,
        }}
      >
        <TeamsClientProvider setTheme={setTheme}>
          <div
            className="App"
            style={{
              minHeight: "0px",
              position: "absolute",
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              overflow: "hidden",
            }}
          >
            <AuthLayoutContainer>{children}</AuthLayoutContainer>
          </div>
        </TeamsClientProvider>
      </FluentProvider>
    </UserProvider>
  );
};

'use client'

import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { app } from "@microsoft/teams-js";
import { LoadErrorWrapper } from "../../components/view-wrappers";
import { inTeams } from "../../utils";
import { Theme } from "@fluentui/react-components";
import { ITeamsClientContext } from "../../models";
import { useTeamsAppContext } from "./internals";

// Teams Context
export const TeamsClientContext = createContext<ITeamsClientContext>(
  {} as ITeamsClientContext
);

// React useContext
export const useTeamsClientContext = (): ITeamsClientContext => {
  const context = useContext(TeamsClientContext);
  return context;
};

// React Context Provider
export const TeamsClientProvider: FC<{
  children: ReactNode;
  setTheme: Dispatch<SetStateAction<Theme>>;
}> = ({ children, setTheme }) => {
  const [initialized, setInitialized] = useState(false);
  const [initializeError, setError] = useState<Error | undefined>(undefined);
  const { teamsContext, error: appContextError } = useTeamsAppContext(
    initialized,
    setTheme
  );

  useEffect(() => {
    if (!initialized) {
      if (inTeams()) {
        console.log("App.tsx: initializing client SDK");
        // Allow all Sandpack subdomains, format https://a-b-c-sandpack.codesandbox.io
        const allSandpackUrls: string[] = [];
        for (let a = 0; a < 50; a++) {
          for (let b = 0; b < 50; b++) {
            for (let c = 0; c < 50; c++) {
              allSandpackUrls.push(
                `https://${a}-${b}-${c}-sandpack.codesandbox.io`
              );
            }
          }
        }
        app
          .initialize([
            ...allSandpackUrls,
            "https://teams.microsoft.com",
            "https://www.codebox.live",
          ])
          .then(() => {
            console.log("App.tsx: initializing client SDK initialized");
            app.notifyAppLoaded();
            app.notifySuccess();
            setInitialized(true);
          })
          .catch((error) => setError(error));
      } else {
        setInitialized(true);
      }
    }
  }, [initialized]);

  const isLoading = !initialized || !teamsContext;
  const error = initializeError || appContextError;
  return (
    <TeamsClientContext.Provider
      value={{
        teamsContext,
      }}
    >
      <LoadErrorWrapper loading={isLoading} error={error}>
        {children}
      </LoadErrorWrapper>
    </TeamsClientContext.Provider>
  );
};

/*!
 * Copyright (c) Ryan Bliss. All rights reserved.
 * Licensed under the MIT License.
 */
import { IFluidContainer, SharedMap } from "fluid-framework";
import { useEffect, useRef, useState } from "react";
import {
  IFluidContainerResults,
  IFollowModeStateValue,
} from "../../../../models";
import { getAzureContainer } from "../../../../utils";
import { useTeamsClientContext } from "../../../teams-client-provider";
import { LivePresence, LiveState } from "@microsoft/live-share";
import { useCodeboxLiveContext } from "@/context-providers";

/**
 * @hidden
 * Hook that creates/loads the apps shared objects.
 *
 * @remarks
 * This is an application specific hook that defines the fluid schema of Distributed Data Structures (DDS)
 * used by the app and passes that schema to the `TeamsFluidClient` to create/load your Fluid container.
 *
 * @see useFluidObjectsContext for consuming ILiveShareContext using React Context.
 * @returns Shared objects managed by the apps fluid container.
 */
export function useFluidContainerResults(): IFluidContainerResults {
  const [results, setResults] = useState<
    | {
        container: IFluidContainer;
        services: any;
        created: boolean;
      }
    | undefined
  >();
  const [error, setError] = useState<Error | undefined>();
  const initializedRef = useRef<boolean>(false);
  const { teamsContext } = useTeamsClientContext();
  const { currentProject } = useCodeboxLiveContext();

  useEffect(() => {
    const teamsUserId = teamsContext?.user?.id;
    if (
      initializedRef.current ||
      !teamsUserId ||
      !currentProject?.containerId
    ) {
      return;
    }
    initializedRef.current = true;
    const start = async () => {
      console.log(
        "useFluidContainerResults getting container id",
        currentProject.containerId
      );
      const results = await getAzureContainer(teamsUserId, currentProject);
      console.log("useFluidContainerResults joined container");
      setResults(results);
    };
    start();
  }, [teamsContext, currentProject]);

  useEffect(() => {
    return () => {
      results?.container.dispose?.();
    };
  }, [results]);

  const container = results?.container;
  const initialObjects = container?.initialObjects;

  return {
    loading: !container,
    error,
    container,
    codePagesMap: initialObjects?.codePagesMap as SharedMap | undefined,
    sandpackObjectsMap: initialObjects?.sandpackObjectsMap as
      | SharedMap
      | undefined,
    followModeState: initialObjects?.followModeState as
      | LiveState<string | null>
      | undefined,
    presence: initialObjects?.presence as LivePresence | undefined,
  };
}

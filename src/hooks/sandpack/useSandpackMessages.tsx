import { UncleGatewayHub } from "@codeboxlive/uncle";
import { useEffect, useRef } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { FluidService } from "./FluidService";

export const useSandpackMessages = () => {
  const fluidServiceRef = useRef<FluidService>();
  const { teamsContext } = useTeamsClientContext();
  const { currentProject } = useCodeboxLiveContext();

  useEffect(() => {
    async function start() {
      if (!teamsContext?.user?.id || !currentProject) {
        return;
      }
      // Set up hub
      if (!fluidServiceRef.current) {
        fluidServiceRef.current = new FluidService(
          teamsContext!.user!.id,
          currentProject!,
        );
      }
      console.log("useSandpackMessages: registering gateway");
      await UncleGatewayHub.initialize(
        fluidServiceRef.current!.toFluidRequests()
      );
    }
    start();
  }, [currentProject, teamsContext]);

  return;
};

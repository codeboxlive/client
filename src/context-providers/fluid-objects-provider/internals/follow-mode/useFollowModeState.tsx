import { LiveState, UserMeetingRole } from "@microsoft/live-share";
import { useCallback, useEffect, useState } from "react";
import {
  IFollowModeStateContext,
  IFollowModeStateValue,
} from "../../../../models";
import { useStateRef } from "../../../../hooks";

// Follow mode allows a user to force other users to move to the page that they
// are looking at. Only meeting presenters and organizers have the privilege
// to start and end this mode.
export function useFollowModeState(
  followModeState: LiveState<string | null> | undefined,
  localUserId?: string,
  presentingUserId?: string
): IFollowModeStateContext {
  const [followingUserId, followingUserIdRef, setFollowingUserId] = useStateRef<
    string | undefined
  >(presentingUserId);
  const [started, setStarted] = useState(false);

  const onInitiateFollowMode = useCallback(() => {
    if (localUserId === followingUserIdRef.current) {
      return;
    }
    followModeState?.set(localUserId ?? null);
  }, [localUserId, followingUserIdRef, followModeState]);

  const onEndFollowMode = useCallback(() => {
    if (!followingUserIdRef.current) {
      return;
    }
    followModeState?.set(null);
  }, [followModeState, followingUserIdRef]);

  useEffect(() => {
    if (!followModeState || followModeState.isInitialized) return;
    const onStateChanged = (
      state: string | null,
    ) => {
      setFollowingUserId(state ?? undefined);
    };
    console.log("useFollowModeState: listening to state changes");
    followModeState.on("stateChanged", onStateChanged);
    const allowedRoles: UserMeetingRole[] = [
      UserMeetingRole.organizer,
      UserMeetingRole.presenter,
    ];
    followModeState
      .initialize(null, allowedRoles)
      .then(() => {
        setStarted(true);
      })
      .catch((error) => console.error(error));
    return () => {
      followModeState.off("stateChanged", onStateChanged);
    };
  }, [followModeState, setStarted, setFollowingUserId]);

  return {
    followModeStateStarted: started,
    followingUserId,
    onInitiateFollowMode,
    onEndFollowMode,
  };
}

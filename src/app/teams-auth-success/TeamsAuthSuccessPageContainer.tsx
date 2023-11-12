"use client";
import { LoadWrapper } from "@/components/view-wrappers";
import { authentication } from "@microsoft/teams-js";
import { FC, useEffect } from "react";

export const TeamsAuthSuccessPageContainer: FC<{
  appSession: string | undefined;
}> = ({ appSession }) => {
  useEffect(() => {
    if (!appSession) return;
    authentication.notifySuccess(appSession);
  }, [appSession]);
  return <LoadWrapper text="Finalizing auth..." />;
};

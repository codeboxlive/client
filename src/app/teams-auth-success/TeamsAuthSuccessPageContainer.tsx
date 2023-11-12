"use client"
import { LoadWrapper } from "@/components/view-wrappers";
import { authentication } from "@microsoft/teams-js";
import { FC, useEffect } from "react";

export const TeamsAuthSuccessPageContainer: FC = () => {
    useEffect(() => {
        authentication.notifySuccess(document.cookie);
    }, []);
    return (
        <LoadWrapper text="Finalizing auth..."/>
    )
}

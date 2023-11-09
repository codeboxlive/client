"use client";
import { CodeProject } from "@/components";
import {
  FluidObjectsProvider,
  useCodeboxLiveContext,
} from "@/context-providers";
import { FC, useEffect } from "react";

interface IProjectPageContainerProps {
  projectId: string;
}

export const ProjectPageContainer: FC<IProjectPageContainerProps> = ({
  projectId,
}) => {
  const { setCurrentProjectId } = useCodeboxLiveContext();
  useEffect(() => {
    console.log("setting current project id", projectId);
    setCurrentProjectId(projectId);
  }, [projectId, setCurrentProjectId]);
  return (
    <FluidObjectsProvider>
      <CodeProject />
    </FluidObjectsProvider>
  );
};

"use client";
import { CodeProject } from "@/components/code-project";
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
    setCurrentProjectId(projectId);
  }, [projectId, setCurrentProjectId]);
  return (
    <FluidObjectsProvider>
      <CodeProject />
    </FluidObjectsProvider>
  );
};

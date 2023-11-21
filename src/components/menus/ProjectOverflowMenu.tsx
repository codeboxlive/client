"use client";

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import {
  MoreHorizontal20Regular,
  Delete20Regular,
  Open20Regular,
  Pin20Regular,
  PinOff20Regular,
  ArrowCircleRight20Regular,
  Edit20Regular,
} from "@fluentui/react-icons";
import { FC, useCallback, useState } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "@/context-providers";
import { IProject } from "../../models";
import { inTeams, openInStageView } from "../../utils";
import { useRouter } from "next/navigation";
import { EditProjectDialog } from "../create-project/EditProjectDialog";

interface IProjectOverflowMenuProps {
  project: IProject;
  redirectOnDelete?: boolean;
  onOpen?: () => void;
}

export const ProjectOverflowMenu: FC<IProjectOverflowMenuProps> = ({
  project,
  redirectOnDelete,
  onOpen,
}) => {
  const { teamsContext } = useTeamsClientContext();
  const {
    pinnedProjects,
    deleteProject,
    pinProjectToTeams,
    unpinProjectToTeams,
  } = useCodeboxLiveContext();
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const onDelete = useCallback(async () => {
    if (redirectOnDelete) {
      router.push(`/projects?inTeams=${inTeams()}`);
    }
    try {
      await deleteProject(project);
    } catch (error: any) {
      console.error(error);
    }
  }, [project, redirectOnDelete, deleteProject, router]);

  const onOpenStageView = useCallback(async () => {
    try {
      await openInStageView(project, teamsContext);
    } catch (error: any) {
      console.error(error);
    }
  }, [project, teamsContext]);

  const onPinProjectToTeams = useCallback(async () => {
    const threadId = teamsContext?.channel?.id || teamsContext?.chat?.id;
    if (threadId) {
      try {
        await pinProjectToTeams(project, threadId);
      } catch (error: any) {
        console.error(error);
      }
    }
  }, [project, teamsContext, pinProjectToTeams]);

  const onUnpinProjectToTeams = useCallback(async () => {
    const threadId = teamsContext?.channel?.id || teamsContext?.chat?.id;
    if (threadId) {
      try {
        await unpinProjectToTeams(project, threadId);
      } catch (error: any) {
        console.error(error);
      }
    }
  }, [project, teamsContext, unpinProjectToTeams]);

  const showPin = !!teamsContext?.channel?.id || !!teamsContext?.chat?.id;
  const isPinned = !!pinnedProjects.find(
    (checkProject) => checkProject._id === project._id
  );
  return (
    <>
      <Menu>
        <MenuTrigger>
          <Button
            appearance="subtle"
            icon={<MoreHorizontal20Regular />}
            title="More"
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {!!onOpen && (
              <MenuItem icon={<ArrowCircleRight20Regular />} onClick={onOpen}>
                {"Open"}
              </MenuItem>
            )}
            <MenuItem icon={<Open20Regular />} onClick={onOpenStageView}>
              {"Open in pop out"}
            </MenuItem>
            <MenuItem icon={<Edit20Regular />} onClick={() => {
              setEditDialogOpen(true);
            }}>
              {"Edit"}
            </MenuItem>
            {showPin && !isPinned && (
              <MenuItem icon={<Pin20Regular />} onClick={onPinProjectToTeams}>
                {`Pin to ${teamsContext?.channel ? "channel" : "chat"}`}
              </MenuItem>
            )}
            {showPin && isPinned && (
              <MenuItem
                icon={<PinOff20Regular />}
                onClick={onUnpinProjectToTeams}
              >
                {`Unpin from ${teamsContext?.channel ? "channel" : "chat"}`}
              </MenuItem>
            )}
            <MenuItem icon={<Delete20Regular />} onClick={onDelete}>
              {"Delete project"}
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <EditProjectDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        project={project}
      />
    </>
  );
};

import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Spinner,
  Text,
} from "@fluentui/react-components";
import { useCodeboxLiveContext } from "../../context-providers";
import { IProject } from "../../models";
import { FlexColumn } from "../flex";
import { Alert } from "@fluentui/react-components/unstable";
import { getFlexColumnStyles } from "../flex/column/FlexColumn-styles";
import { FormTextField } from "../form";

interface IEditProjectDialogProps {
  project: IProject;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const EditProjectDialog: FC<IEditProjectDialogProps> = ({
  project,
  open,
  setOpen,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { setProject } = useCodeboxLiveContext();
  const [customTitle, setCustomTitle] = useState<string>(project.title);

  const onSaveChanges = useCallback(async () => {
    if (!customTitle) return;
    setLoading(true);
    try {
      await setProject({
        _id: project._id,
        title: customTitle,
      });
      setOpen(false);
    } catch (error: any) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(
          new Error("An unknown error occurred while creating this template")
        );
      }
    } finally {
      setLoading(false);
    }
  }, [customTitle, project, setError, setProject, setLoading, setOpen]);

  const { scroll: scrollStyle } = getFlexColumnStyles();

  return (
    <Dialog
      modalType={loading ? "alert" : "modal"}
      open={open}
      onOpenChange={(event, data) => {
        setOpen(data.open);
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{"Edit project"}</DialogTitle>
          <DialogContent className={scrollStyle}>
            <FlexColumn marginSpacer="medium">
              <FormTextField
                id="project-title"
                label="Title"
                placeholder={"Enter project title..."}
                required
                value={customTitle}
                disabled={loading}
                onChange={setCustomTitle}
              />
              {loading && (
                <FlexColumn
                  vAlign="center"
                  hAlign="center"
                  marginSpacer="small"
                  style={{ minHeight: "5.4rem" }}
                >
                  <Text>{"Saving changes..."}</Text>
                  <Spinner />
                </FlexColumn>
              )}
              {error && (
                <Alert intent="error" action="Retry" onClick={onSaveChanges}>
                  {error.message}
                </Alert>
              )}
            </FlexColumn>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" disabled={loading}>
                {"Cancel"}
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              disabled={!customTitle || loading}
              onClick={onSaveChanges}
            >
              {"Save"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

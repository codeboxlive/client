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
  MenuItem,
  Spinner,
  Text,
} from "@fluentui/react-components";
import { useCodeboxLiveContext } from "../../context-providers";
import {
  FrameworkType,
  IRadioItem,
  isFrameworkType,
  isLanguageType,
  LanguageType,
} from "../../models";
import { FormRadioGroup } from "../form/FormRadioGroup";
import { FlexColumn } from "../flex";
import { Alert } from "@fluentui/react-components/unstable";
import { getFlexColumnStyles } from "../flex/column/FlexColumn-styles";
import { FormTextField } from "../form";

interface ICreateProjectViaTemplateDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const LANGUAGE_TYPE_RADIO_ITEMS: IRadioItem[] = [
  {
    value: LanguageType.typescript,
    label: "TypeScript",
  },
  {
    value: LanguageType.javascript,
    label: "JavaScript",
  },
];

const FRAMEWORK_TYPE_RADIO_ITEMS: IRadioItem[] = [
  {
    value: FrameworkType.react,
    label: "React",
  },
  {
    value: FrameworkType.vanilla,
    label: "Vanilla",
  },
  {
    value: FrameworkType.vue,
    label: "Vue",
  },
  {
    value: FrameworkType.svelte,
    label: "Svelte Kit",
  },
  {
    value: FrameworkType.angular,
    label: "Angular",
  },
];

export const CreateProjectViaTemplateDialog: FC<
  ICreateProjectViaTemplateDialogProps
> = ({ open, setOpen }) => {
  const { createProject, projectTemplates } = useCodeboxLiveContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [language, setLanguage] = useState<LanguageType>(
    LanguageType.typescript
  );
  const [framework, setFramework] = useState<FrameworkType>(
    FrameworkType.react
  );
  const [preset, setPreset] = useState<string>();
  const [customTitle, setCustomTitle] = useState<string>("");

  const onCreate = useCallback(async () => {
    const template = projectTemplates?.find(
      (checkTemplate) => checkTemplate.gitRemoteUrl === preset
    );
    if (template) {
      setLoading(true);
      try {
        await createProject(
          template,
          customTitle !== "" ? customTitle : undefined
        );
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
    }
  }, [customTitle, createProject, preset, projectTemplates, setOpen]);

  const onChangeLanguage = useCallback((value: string) => {
    if (isLanguageType(value)) {
      setLanguage(value);
    }
  }, []);

  const onChangeFramework = useCallback((value: string) => {
    if (isFrameworkType(value)) {
      setFramework(value);
    }
  }, []);

  const onChangePreset = useCallback(
    (value: string) => {
      const template = projectTemplates?.find(
        (checkTemplate) => checkTemplate.gitRemoteUrl === value
      );
      if (template) {
        setPreset(value);
      }
    },
    [projectTemplates]
  );

  const presetRadioItems: IRadioItem[] | undefined = projectTemplates
    ?.filter(
      (template) =>
        template.language === language && template.framework === framework
    )
    .map((template) => ({
      value: template.gitRemoteUrl,
      label: template.title,
    }));

  const { scroll: scrollStyle } = getFlexColumnStyles();

  const presetTemplate = projectTemplates?.find(
    (checkTemplate) => checkTemplate.gitRemoteUrl === preset
  );

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
          <DialogTitle>{"New project"}</DialogTitle>
          <DialogContent className={scrollStyle}>
            <FlexColumn marginSpacer="medium">
              <FormRadioGroup
                id={"language"}
                title={"Language"}
                required
                disabled={loading}
                selectedValue={language}
                radioItems={LANGUAGE_TYPE_RADIO_ITEMS}
                onChange={onChangeLanguage}
              />
              <FormRadioGroup
                id={"framework"}
                title={"Framework"}
                required
                disabled={loading}
                selectedValue={framework}
                radioItems={FRAMEWORK_TYPE_RADIO_ITEMS}
                onChange={onChangeFramework}
              />
              {presetRadioItems && (
                <FormRadioGroup
                  id={"preset"}
                  title={"Preset"}
                  required
                  disabled={loading}
                  selectedValue={preset}
                  radioItems={presetRadioItems}
                  onChange={onChangePreset}
                />
              )}
              <FormTextField
                id="project-title"
                label="Title"
                placeholder={presetTemplate?.title ?? "Enter a custom title..."}
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
                  <Text>{"Creating project..."}</Text>
                  <Spinner />
                </FlexColumn>
              )}
              {error && (
                <Alert intent="error" action="Retry" onClick={onCreate}>
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
              disabled={
                !language ||
                !framework ||
                !preset ||
                !presetRadioItems ||
                loading
              }
              onClick={onCreate}
            >
              {"Create"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

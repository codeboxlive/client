import { FrameworkType, IProjectTemplate, LanguageType } from "@/models";

export const PROJECT_TEMPLATES: IProjectTemplate[] = [
  {
    language: LanguageType.typescript,
    framework: FrameworkType.react,
    title: "Hello World",
    description: "React TypeScript Hello World starter application",
    gitRemoteUrl: "https://github.com/codeboxlive/react-ts-template.git",
    branch: "main",
  },
  {
    language: LanguageType.typescript,
    framework: FrameworkType.react,
    title: "Microsoft Teams tab app",
    description: "Microsoft Teams tab starter application",
    gitRemoteUrl: "https://github.com/codeboxlive/teams-react-ts-template.git",
    branch: "main",
  },
  {
    language: LanguageType.typescript,
    framework: FrameworkType.react,
    title: "Fluid Framework",
    description: "Fluid Framework TypeScript starter application",
    gitRemoteUrl: "https://github.com/codeboxlive/fluid-react-ts-template.git",
    branch: "main",
  },
  {
    language: LanguageType.typescript,
    framework: FrameworkType.react,
    title: "Microsoft Teams Live Share app",
    description: "Microsoft Teams Live Share starter application",
    gitRemoteUrl:
      "https://github.com/codeboxlive/live-share-react-ts-template.git",
    branch: "main",
  },
];

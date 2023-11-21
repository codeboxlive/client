"use client";
import { CSSProperties, FC, memo, useEffect } from "react";
import { useFocusableGroup } from "@fluentui/react-components";
import { useMonacoFluidAdapter } from "./adapter";

interface IMonacoEditorProps {
  theme: "vs-dark" | "light";
  style?: CSSProperties;
}

export const MonacoEditor: FC<IMonacoEditorProps> = memo(
  (props) => {
    // Set up the Monaco editor and apply/post changes
    // to/from SharedString
    useMonacoFluidAdapter("container", props.theme);

    const attributes = useFocusableGroup({
      tabBehavior: "limited-trap-focus",
      ignoreDefaultKeydown: {
        Tab: true,
      },
    });

    useEffect(() => {
      return () => {
        console.log("unmount MonacoEditor");
      };
    }, []);

    // Render the view
    return (
      <div style={props.style} {...attributes}>
        <div id="container" style={{ width: "100%", height: "100%" }} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    const styleEqual =
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style);
    return styleEqual && prevProps.theme === nextProps.theme;
  }
);
MonacoEditor.displayName = "MonacoEditor";

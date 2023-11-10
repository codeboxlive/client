"use client"; // Error components must be Client Components

import { FlexColumn } from "@/components/flex";
import { Button, Title1 } from "@fluentui/react-components";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <FlexColumn expand="fill" vAlign="center" hAlign="center">
      <Title1>{error?.message}</Title1>
      <Button
        appearance="primary"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </FlexColumn>
  );
}

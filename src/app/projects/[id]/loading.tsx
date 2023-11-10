"use client";

import { FlexColumn } from "@/components/flex";
import { Spinner, Text } from "@fluentui/react-components";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <FlexColumn
      expand="fill"
      vAlign="center"
      hAlign="center"
      marginSpacer="small"
    >
      <Spinner />
      <Text>
        Loading project...
      </Text>
    </FlexColumn>
  );
}

"use client";

import { LoadWrapper } from "@/components/view-wrappers/loadable-wrapper/LoadWrapper";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <LoadWrapper text="Loading projects..." />;
}

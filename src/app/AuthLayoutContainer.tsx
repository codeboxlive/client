"use client";

import { FC, PropsWithChildren } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoadWrapper } from "@/components/view-wrappers";

export const AuthLayoutContainer: FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useUser();

  if (isLoading) {
    return <LoadWrapper text="Loading user..." />;
  }

  return <>{children}</>;
};

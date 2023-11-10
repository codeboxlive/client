"use client";

import React, { PropsWithChildren } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoadWrapper } from "@/components";

export const AuthLayoutContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useUser();

  if (isLoading) {
    return <LoadWrapper text="Loading..." />;
  }

  return <>{children}</>;
};

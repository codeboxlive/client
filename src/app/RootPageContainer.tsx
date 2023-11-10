"use client";

import { FlexColumn, FlexRow } from "@/components";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Subtitle1, Title1 } from "@fluentui/react-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

export const RootPageContainer: FC = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    router.push("/projects");
  }, [user, router]);

  return (
    <FlexColumn expand="fill">
      <FlexColumn
        scroll
        style={{
          padding: "24px",
        }}
      >
        <FlexColumn marginSpacer="medium">
          <FlexColumn marginSpacer="small">
            <Title1>{"Welcome to Codebox Live"}</Title1>
            <Subtitle1>{"Please log in to continue"}</Subtitle1>
          </FlexColumn>
          <FlexRow marginSpacer="small">
            <Link href="/api/auth/signup">
              <Button appearance="outline">
                {"Sign up"}
              </Button>
            </Link>
            <Link href="/api/auth/login">
              <Button appearance="primary">
                {"Log in"}
              </Button>
            </Link>
          </FlexRow>
        </FlexColumn>
      </FlexColumn>
    </FlexColumn>
  );
};

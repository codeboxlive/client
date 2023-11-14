import { Button, Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { NavigationBar } from "./NavigationBar";
import Link from "next/link";
import { inTeams } from "@/utils";

export const HomeNavigationBar: FC = () => {
  const pathname = usePathname();
  return (
    <NavigationBar
      isL1={true}
      leftActions={
        <TabList selectedValue={pathname}>
          <Tab value={"/projects"}>{"Projects"}</Tab>
        </TabList>
      }
      rightActions={
        <Link href={`/api/auth/logout?returnTo=/?inTeams=${inTeams()}`}>
          <Button size="small" appearance="subtle">
            {"Log out"}
          </Button>
        </Link>
      }
    />
  );
};

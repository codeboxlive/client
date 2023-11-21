import { Button, Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { NavigationBar } from "./NavigationBar";
import Link from "next/link";
import { inTeams } from "@/utils";

export const HomeNavigationBar: FC = () => {
  const pathname = usePathname();
  const IN_TEAMS = inTeams();
  return (
    <NavigationBar
      isL1={true}
      leftActions={
        <TabList selectedValue={pathname}>
          <Tab value={"/projects"}>{"Projects"}</Tab>
        </TabList>
      }
      rightActions={
        <Link
          href={`/api/${
            IN_TEAMS ? "auth-teams" : "auth"
          }/logout?returnTo=/?inTeams=${IN_TEAMS}`}
        >
          <Button size="small" appearance="subtle" tabIndex={-1}>
            {"Log out"}
          </Button>
        </Link>
      }
    />
  );
};

import { Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavigationBar } from "./NavigationBar";
import { ProfileMenu } from "./profile-menu/ProfileMenu";
import { inTeams } from "@/utils";

export const HomeNavigationBar: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <NavigationBar
      isL1={true}
      leftActions={
        <TabList
          selectedValue={pathname}
          onTabSelect={(evt, data) => {
            if (typeof data.value === "string") {
              router.push(`${data.value}?inTeams=${inTeams()}`);
            }
          }}
        >
          <Tab value={"/projects"}>{"Projects"}</Tab>
        </TabList>
      }
      rightActions={<ProfileMenu />}
    />
  );
};

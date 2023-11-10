import { Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { usePathname } from 'next/navigation'
import { NavigationBar } from "./NavigationBar";

export const HomeNavigationBar: FC = () => {
  const pathname = usePathname();
  return (
    <NavigationBar
      isL1={true}
      leftActions={
        <TabList selectedValue={pathname}>
          <Tab value={"/"}>{"Projects"}</Tab>
        </TabList>
      }
    />
  );
};

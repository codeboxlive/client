"use client";

import { inTeams } from "@/utils";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Avatar,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
} from "@fluentui/react-components";
import { Person20Regular, SignOut20Regular } from "@fluentui/react-icons";
import { useRouter } from "next/navigation";
import { FC } from "react";

export const ProfileMenu: FC = () => {
  const { user } = useUser();
  const router = useRouter();
  if (!user) {
    return null;
  }
  const IN_TEAMS = inTeams();
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Avatar
          name={user.name ?? user.email ?? "Unknown"}
          image={{
            src: user.picture ?? undefined,
          }}
          role="button"
          /** Prevents the button jumping due to Flex not:last-child styles. Can't be a class or it will be overrode by Flex styles. */
          style={{ marginRight: 0, cursor: "pointer" }}
        />
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          <MenuItem
            icon={<Person20Regular />}
            onClick={() => {
              router.push(`/profile?inTeams=${IN_TEAMS}`);
            }}
          >
            {"Profile"}
          </MenuItem>
          <MenuItem
            icon={<SignOut20Regular />}
            onClick={() => {
              router.push(
                `/api/auth/logout?inTeams=${IN_TEAMS}&returnTo=/`
              );
            }}
          >
            {"Sign out"}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

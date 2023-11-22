"use server";

import { IPrivateUserInfo, IPublicUserInfo } from "@/models";
import { RequiresAuthError } from "@/models/errors";
import { sessionToIPrivateUserInfo } from "@/utils/auth-utils";
import { getSession } from "@auth0/nextjs-auth0";

export async function getPrivateUserInfo(): Promise<IPrivateUserInfo> {
  const session = await getSession();

  if (!session) {
    throw new RequiresAuthError();
  }

  return sessionToIPrivateUserInfo(session);
}

export async function getPublicUserInfo(): Promise<IPublicUserInfo> {
  const privateInfo = await getPrivateUserInfo();
  return {
    sub: privateInfo.sub,
    name: privateInfo.name,
    family_name: privateInfo.family_name,
    given_name: privateInfo.given_name,
    picture: privateInfo.picture,
  };
}

export async function getUserId(): Promise<string> {
  const user = await getPublicUserInfo();
  return user.sub;
}

"use server";

import { RequiresAuthError } from "@/models/errors";
import { getSession } from "@auth0/nextjs-auth0";

export async function getUserInfo(): Promise<{
  sub: string;
  name: string;
  family_name?: string;
  given_name?: string;
  picture?: string;
}> {
  const session = await getSession();

  if (!session) {
    throw new RequiresAuthError();
  }

  const { user } = session;

  if (typeof user.sub !== "string") {
    throw new Error("auth.getUserInfo: invalid sub value");
  }

  const name = typeof user.name === "string" ? user.name : undefined;
  const nickname =
    typeof user.nickname === "string" ? user.nickname : undefined;
  const email = typeof user.email === "string" ? user.email : undefined;

  return {
    sub: user.sub,
    name: name ?? nickname ?? email ?? "Unknown",
    family_name:
      typeof user.family_name === "string" ? user.family_name : undefined,
    given_name:
      typeof user.given_name === "string" ? user.given_name : undefined,
    picture: typeof user.picture === "string" ? user.picture : undefined,
  };
}

export async function getUserId(): Promise<string> {
  const user = await getUserInfo();
  return user.sub;
}

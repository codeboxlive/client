"use server";

import { RequiresAuthError } from "@/models/errors";
import { getSession } from "@auth0/nextjs-auth0";

export async function getUserId(): Promise<string> {
  const session = await getSession();

  if (!session) {
    throw new RequiresAuthError();
  }

  const { user } = session;

  return user.sub;
}

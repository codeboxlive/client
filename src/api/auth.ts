"use server";

import { Claims, getSession } from "@auth0/nextjs-auth0";

export async function getUserId(): Promise<string> {
  const session = await getSession();

  if (!session) {
    throw new Error(`Requires authentication`);
  }

  const { user } = session;

  return user.sub;
}

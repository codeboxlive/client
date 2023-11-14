"use server";

import { Claims, getSession } from "@auth0/nextjs-auth0";

export async function getUserId(): Promise<string> {
  const session = await getSession();

  if (!session) {
    throw new RequiresAuthError();
  }

  const { user } = session;

  return user.sub;
}

export class RequiresAuthError extends Error {
  constructor() {
    super("Authentication required");
  }
}

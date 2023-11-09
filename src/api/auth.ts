"use server";

import { cookies } from "next/headers";

export async function getUserId(): Promise<string> {
  const cookieStore = cookies();
  const auth = cookieStore.get("Authorization");
  if (!auth?.value) {
    throw new Error("User ID not set. This should not happen. Ensure `authIfNeeded()` is called first.");
  }
  return auth.value.replace("Bearer ", "");
}

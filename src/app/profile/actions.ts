"use server";

import { getUserId } from "@/api";
import { fetchFromAuth0Management } from "@/api/auth0-management";
import { getSession, updateSession } from "@auth0/nextjs-auth0";
import { RedirectType, redirect } from "next/navigation";

async function getExistingUserData(userId: string): Promise<any> {
  const response = await fetchFromAuth0Management(
    `users/${userId}`,
    {
      method: "GET",
    },
    {
      Accept: "application/json",
    }
  );
  const json = await response.json();
  if (isAuth0Error(json)) {
    throw new Error(`[${json.statusCode} ${json.error}] ${json.message}`);
  }
  return json;
}

export async function editBasicProfile(formData: FormData) {
  const userId = await getUserId();
  let existingData: any;
  try {
    existingData = await getExistingUserData(userId);
  } catch (error) {
    console.error(error);
    return { message: "Unable to get existing user data" };
  }
  const inTeams = formData.get("inTeams") === "true";
  const given_name_raw = formData.get("given_name");
  const given_name =
    typeof given_name_raw === "string"
      ? given_name_raw
      : existingData.given_name;
  const family_name_raw = formData.get("family_name");
  const family_name =
    typeof family_name_raw === "string"
      ? family_name_raw
      : existingData.family_name;
  const phone_number_raw = formData.get("phone_number");
  const phone_number =
    typeof phone_number_raw === "string" && phone_number_raw !== ""
      ? phone_number_raw
      : existingData.phone_number;
  const data = {
    blocked: existingData.blocked,
    // email_verified: existingData.email_verified,
    given_name,
    family_name,
    phone_number,
    phone_verified: existingData.phone_verified,
    user_metadata: existingData.user_metadata,
    app_metadata: existingData.app_metadata,
    nickname: existingData.nickname,
    picture: existingData.picture,
    verify_email: existingData.verify_email,
    verify_phone_number: existingData.verify_phone_number,
    password: existingData.password,
    connection: existingData.connection,
    client_id: existingData.client_id,
    username: existingData.username,
    name:
      given_name || family_name
        ? `${given_name ? given_name + " " : ""}${
            family_name ? family_name : ""
          }`
        : existingData.name,
  };
  try {
    const response = await fetchFromAuth0Management(
      `users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      {
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    );
    const json = await response.json();
    if (isAuth0Error(json)) {
      throw new Error(`[${json.statusCode} ${json.error}] ${json.message}`);
    }
    console.log("/profile.editBasicProfile: successfully updated user");
  } catch (e) {
    console.error(e);
    return { message: "Failed to create" };
  }
  const session = await getSession();
  if (!session) {
    return {
      message:
        "Internal error: failed to fetch existing session, which is an unexpected error.",
    };
  }
  await updateSession({ ...session, user: {
    ...session.user,
    family_name,
    given_name,
  }});
  redirect(
    `/api/${
      inTeams ? "auth-teams" : "auth"
    }/refresh-profile?returnTo=/profile?inTeams=${inTeams}`,
    RedirectType.push
  );
}

function isAuth0Error(value: any): value is {
  statusCode: number;
  error: string;
  message: string;
} {
  return (
    typeof value?.statusCode === "number" &&
    typeof value?.error === "string" &&
    typeof value?.message === "string"
  );
}

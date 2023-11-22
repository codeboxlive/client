import { v4 as uuid } from "uuid";
import { Session } from "@auth0/nextjs-auth0";
import { IPrivateUserInfo } from "@/models";

export interface IOAuthCodeData {
  accessToken: string;
  tid: string;
}

const codeMap = new Map<string, IOAuthCodeData>();
export function getOAuthCode(accessToken: string, tid: string): string {
  const code = uuid();
  codeMap.set(code, {
    accessToken,
    tid,
  });
  return code;
}

export function getTokenForCode(code: string): IOAuthCodeData {
  const res = codeMap.get(code);
  if (res === undefined) {
    throw new Error("Code not found");
  }
  codeMap.delete(code);
  return res;
}

export function isAuth0Error(value: any): value is {
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

export function sessionToIPrivateUserInfo(session: Session): IPrivateUserInfo {
  const { user } = session;

  if (typeof user.sub !== "string") {
    throw new Error("auth.getUserInfo: invalid sub value");
  }

  const name = typeof user.name === "string" ? user.name : undefined;
  const nickname =
    typeof user.nickname === "string" ? user.nickname : undefined;
  const email = typeof user.email === "string" ? user.email : undefined;
  const phone_number =
    typeof user.phone_number === "string" ? user.phone_number : undefined;

  return {
    sub: user.sub,
    name: name ?? nickname ?? email ?? "Unknown",
    family_name:
      typeof user.family_name === "string" ? user.family_name : undefined,
    given_name:
      typeof user.given_name === "string" ? user.given_name : undefined,
    picture: typeof user.picture === "string" ? user.picture : undefined,
    email,
    phone_number,
  };
}

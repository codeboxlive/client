import {
  AfterRefetch,
  Session,
  getSession,
  handleAuth,
  handleLogin,
  handleLogout,
  handleProfile,
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

// Updating with the new session from the server
const afterRefetch: AfterRefetch = (req, res, session) => {
  const newSession = getSession(req, res);
  if (newSession) {
    return newSession as Promise<Session>;
  }
  return session;
};

export const GET = handleAuth({
  login: handleLogin({
    returnTo: "/projects",
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: "signup",
    },
    returnTo: "/projects",
  }),
  logout: handleLogout({
    returnTo: "/",
  }),
  "refresh-profile": async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleProfile(req, res, { refetch: true, afterRefetch });
    } catch (error) {
      console.error(error);
    }
    let url = new URL(req.url!);
    const returnTo = url.searchParams.get("returnTo");
    return NextResponse.redirect(url.origin + returnTo);
  },
});

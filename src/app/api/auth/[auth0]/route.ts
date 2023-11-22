import { upsertUser } from "@/api/upsertUser";
import {
  AfterRefetch,
  AfterCallbackAppRoute,
  getSession,
  handleAuth,
  handleLogin,
  handleLogout,
  handleProfile,
  handleCallback,
  Session,
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

// Updating with the new session from the server
const afterRefetch: AfterRefetch = (
  req,
  res,
  existingSession
): Promise<Session> => {
  const newSession = getSession(req, res).then(async (session) => {
    if (!session) {
      return existingSession;
    }
    return session;
  });
  return newSession;
};

const afterRefetchWithUpsert: AfterRefetch = (
  req,
  res,
  existingSession
): Promise<Session> => {
  const callback = afterRefetch(req, res, existingSession) as Promise<Session>;
  const sessionPromise = callback.then(async (session) => {
    await upsertUser(session);
    return session;
  });
  return sessionPromise;
};

const internalHandleLogin = async (
  req: NextApiRequest,
  res: NextApiResponse,
  screen_hint?: string
) => {
  let url = new URL(req.url!);
  return handleLogin(req, res, {
    // This will get overwrote by handleLogin if ?returnTo is set
    returnTo: "/projects",
    authorizationParams: {
      screen_hint,
      connection: url.searchParams.get("connection") ?? undefined,
    },
  });
};

const afterCallback: AfterCallbackAppRoute = async (req, session, state) => {
  console.log(JSON.stringify(state));
  await upsertUser(session);
  return session;
};

export const GET = handleAuth({
  login: (req: NextApiRequest, res: NextApiResponse) => {
    return internalHandleLogin(req, res);
  },
  signup: (req: NextApiRequest, res: NextApiResponse) => {
    return internalHandleLogin(req, res, "signup");
  },
  logout: (req: NextApiRequest, res: NextApiResponse) => {
    let url = new URL(req.url!);
    const inTeams = url.searchParams.get("inTeams") === "true";
    const returnTo = `${
      url.searchParams.get("returnTo") ?? "/"
    }?inTeams=${inTeams}`;
    return handleLogout(req, res, {
      returnTo,
    });
  },
  callback: handleCallback({
    afterCallback,
  }),
  "refresh-profile": async (req: NextApiRequest, res: NextApiResponse) => {
    let url = new URL(req.url!);
    const returnTo = url.searchParams.get("returnTo");
    const upsert = url.searchParams.get("upsert") === "true";
    try {
      await handleProfile(req, res, {
        refetch: true,
        afterRefetch: upsert ? afterRefetchWithUpsert : afterRefetch,
      });
    } catch (error) {
      console.error(error);
    }

    return NextResponse.redirect(url.origin + returnTo);
  },
});

import { handleAuth, handleLogin, handleLogout } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: handleLogin((req) => {
    const url = new URL(req.url!);
    return {
      returnTo: "/teams-auth-success?inTeams=true",
      authorizationParams: {
        connection: url.searchParams.get("connection") ?? undefined,
      },
    };
  }),
  signup: handleLogin((req) => {
    const url = new URL(req.url!);
    return {
      authorizationParams: {
        screen_hint: "signup",
        connection: url.searchParams.get("connection") ?? undefined,
      },
      returnTo: "/teams-auth-success?inTeams=true",
    };
  }),
  logout: handleLogout({
    returnTo: "/?inTeams=true",
  }),
});

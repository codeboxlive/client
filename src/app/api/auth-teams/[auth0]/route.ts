import { handleAuth, handleLogin, handleLogout } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: handleLogin({
    returnTo: "/teams-auth-success?inTeams=true",
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: "signup",
    },
    returnTo: "/teams-auth-success?inTeams=true",
  }),
  logout: handleLogout({
    returnTo: "/?inTeams=true",
  }),
});

import validateTeamsToken from "@/api/validateTeamsToken";
import { getOAuthCode } from "@/utils/oauth-utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const response_type = searchParams.get("response_type");
  const client_id = searchParams.get("client_id");
  const redirect_uri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");

  if (
    !response_type ||
    !client_id ||
    !redirect_uri ||
    response_type !== "code"
  ) {
    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      { status: 400 }
    );
  }

  // Mock client validation
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(redirect_uri);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid redirectUrl.",
      },
      { status: 400 }
    );
  }
  if (
    client_id !== process.env.AUTH0_TEAMS_TAB_SSO_CLIENT_ID ||
    redirectUrl.origin !== process.env.AUTH0_ISSUER_BASE_URL
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized client.",
      },
      { status: 401 }
    );
  }
  const authorization = req.cookies.get("TeamsAuthorization");
  if (!authorization?.value) {
    return NextResponse.json(
      {
        error: "Unauthorized client; no TeamsAuthorization header.",
      },
      { status: 401 }
    );
  }
  const decoded = await validateTeamsToken(authorization.value);
  const oid = decoded["oid"];
  if (typeof oid !== "string") {
    return NextResponse.json(
      {
        error: "Invalid oid in token.",
      },
      { status: 401 }
    );
  }

  // Generate a mock authorization code
  const authorizationCode = getOAuthCode(oid);
  console.log(
    "redirecting back to auth0 with authorizationCode",
    authorizationCode
  );

  // Redirect to the client's redirect URI with the authorization code
  return NextResponse.redirect(
    `${redirect_uri}?code=${authorizationCode}&state=${state}`
  );
};

import { isOAuthValidCode } from "@/utils/oauth-utils";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  console.log("m365-tab/token: attempting to get token");
  const body = await req.json();

  if (!isIOAuthTokenBody(body)) {
    console.log("m365-tab/token: error invalid request");
    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      { status: 400 }
    );
  }
  const { grant_type, code, redirect_uri, client_id, client_secret } = body;
  console.log("getting token with request details:", JSON.stringify(body));
  if (client_id !== process.env.AUTH0_TEAMS_TAB_SSO_CLIENT_ID) {
    return NextResponse.json(
      {
        error: "Unauthorized client_id.",
      },
      { status: 401 }
    );
  }
  if (client_secret !== process.env.AUTH0_TEAMS_TAB_SSO_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: "Unauthorized secret.",
      },
      { status: 401 }
    );
  }
  if (!isOAuthValidCode(code)) {
    return NextResponse.json(
      {
        error: "Unauthorized code.",
      },
      { status: 401 }
    );
  }
  console.log("m365-tab/token: returning response");
  // Generate a mock access token and a refresh token
  const accessToken = "mockAccessToken123";
  const refreshToken = "mockRefreshToken123";

  // Send the access token and refresh token to the client
  NextResponse.json(
    {
      access_token: accessToken,
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
    },
    { status: 200 }
  );
};

interface IOAuthTokenBody {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

function isIOAuthTokenBody(obj: any): obj is IOAuthTokenBody {
  return (
    obj &&
    obj.grant_type === "authorization_code" &&
    typeof obj.code === "string" &&
    typeof obj.redirect_uri === "string" &&
    typeof obj.client_id === "string" &&
    typeof obj.client_secret === "string"
  );
}

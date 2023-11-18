import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();

  if (!isIOAuthTokenBody(body)) {
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
  if (code !== "mockAuthCode123") {
    return NextResponse.json(
      {
        error: "Unauthorized code.",
      },
      { status: 401 }
    );
  }
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

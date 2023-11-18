import validateTeamsToken from "@/api/validateTeamsToken";
import { isOAuthValidCode } from "@/utils/oauth-utils";
import { NextResponse, NextRequest } from "next/server";
import { msalClient } from "@/api/msal-client";


export const POST = async (req: NextRequest) => {
  console.log("m365-tab/token: attempting to get token");
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Cannot parse JSON body.",
      },
      { status: 500 }
    );
  }

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
  const authorization = req.cookies.get("TeamsAuthorization");
  if (!authorization?.value) {
    return NextResponse.json(
      {
        error: "Unauthorized client; no TeamsAuthorization header.",
      },
      { status: 401 }
    );
  }
  const token = authorization.value.replace("Bearer ", "");
  const decoded = await validateTeamsToken(token);
  const oid = decoded["oid"];
  if (typeof oid !== "string") {
    return NextResponse.json(
      {
        error: "Invalid oid in token.",
      },
      { status: 401 }
    );
  }
  const tid = decoded["tid"];
  if (typeof tid !== "string") {
    return NextResponse.json(
      {
        error: "Invalid tid in token.",
      },
      { status: 401 }
    );
  }
  if (!isOAuthValidCode(code, oid)) {
    return NextResponse.json(
      {
        error: "Unauthorized code.",
      },
      { status: 401 }
    );
  }
  const scopes = ["https://graph.microsoft.com/User.Read"];
  try {
    console.log("oauth2/m365-tab/token: starting to get obo tokens");
    const results = await msalClient.acquireTokenOnBehalfOf({
      authority: `https://login.microsoftonline.com/${tid}`,
      oboAssertion: authorization.value.replace("Bearer ", ""),
      scopes: scopes,
      skipCache: false
    });
    if (!results) {
      throw new Error("Null token response");
    }
    console.log("oauth2/m365-tab/token: received obo tokens");
    // Generate a mock access token and a refresh token

    const expiresOn = results.expiresOn?.getTime() ?? 0;
  
    // Send the access token and refresh token to the client
    return NextResponse.json(
      {
        access_token: results.accessToken,
        token_type: "Bearer",
        expires_in: expiresOn - Date.now(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "Unable to acquire OBO tokens.",
      },
      { status: 401 }
    );
  }
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

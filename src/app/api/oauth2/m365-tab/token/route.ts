import { IOAuthCodeData, getTokenForCode } from "@/utils/oauth-utils";
import { NextResponse, NextRequest } from "next/server";
import { msalClient } from "@/api/msal-client";

export const POST = async (req: NextRequest) => {
  console.log("m365-tab/token: attempting to get token");
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    return NextResponse.json(
      {
        error: "Cannot parse JSON body.",
      },
      { status: 400 }
    );
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    const searchParams = url.searchParams;
    body = {
      grant_type: searchParams.get("grant_type"),
      code: searchParams.get("code"),
      redirect_uri: searchParams.get("redirect_uri"),
      client_id: searchParams.get("client_id"),
      client_secret: searchParams.get("client_secret"),
    };
  }

  if (!isIOAuthTokenBody(body)) {
    console.log("m365-tab/token: error invalid request");
    return NextResponse.json(
      {
        error: "Invalid request body.",
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
  let codeData: IOAuthCodeData;
  try {
    codeData = getTokenForCode(code);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid or expired code.",
      },
      { status: 401 }
    );
  }
  const scopes = ["https://graph.microsoft.com/User.Read"];
  try {
    console.log("oauth2/m365-tab/token: starting to get obo tokens");
    const results = await msalClient.acquireTokenOnBehalfOf({
      authority: `https://login.microsoftonline.com/${codeData.tid}`,
      oboAssertion: codeData.accessToken,
      scopes: scopes,
      skipCache: false,
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
    if (typeof (err as any)?.message === "string")
    return NextResponse.json(
      {
        error: "Unable to acquire OBO tokens. " + (err as any).message,
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

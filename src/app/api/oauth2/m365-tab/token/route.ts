import { IOAuthCodeData, getTokenForCode } from "@/utils/oauth-utils";
import { NextResponse, NextRequest } from "next/server";
import { msalClient } from "@/api/msal-client";

export const POST = async (req: NextRequest) => {
  console.log("m365-tab/token: attempting to get token");
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    console.error("m365-tab/token: cannot parse url");
    return NextResponse.json(
      {
        error: "Cannot parse url.",
      },
      { status: 400 }
    );
  }
  let body: any;
  try {
    const formData = await req.formData();
    console.log("m365-tab/token: using form data", formData.entries());
    body = {
      grant_type: formData.get("grant_type"),
      code: formData.get("code"),
      redirect_uri: formData.get("redirect_uri"),
      client_id: formData.get("client_id"),
      client_secret: formData.get("client_secret"),
    };
  } catch {
    try {
      body = await req.json();
      console.log("m365-tab/token: using JSON");
    } catch {
      const searchParams = url.searchParams;
      console.log(
        "m365-tab/token: using search params",
        searchParams.entries()
      );
      body = {
        grant_type: searchParams.get("grant_type"),
        code: searchParams.get("code"),
        redirect_uri: searchParams.get("redirect_uri"),
        client_id: searchParams.get("client_id"),
        client_secret: searchParams.get("client_secret"),
      };
    }
  }

  if (!isIOAuthTokenBody(body)) {
    console.error(
      "m365-tab/token: error invalid request",
      JSON.stringify(body),
      "\nURL:",
      req.url
    );
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      { status: 400 }
    );
  }
  const { grant_type, code, redirect_uri, client_id, client_secret } = body;

  console.log(
    "getting token with request details:",
    JSON.stringify(body),
    "\nURL:",
    url.href
  );
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

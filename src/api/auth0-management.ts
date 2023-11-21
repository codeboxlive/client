"use server";

interface IManagementToken {
  accessToken: string;
  expiresAt: number;
}
let managementTokenPromise: Promise<IManagementToken> | undefined;

interface IAuth0TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
}

function isIAuthTokenResponse(value: any): value is IAuth0TokenResponse {
  return (
    typeof value?.access_token === "string" &&
    typeof value?.expires_in === "number" &&
    typeof value?.scope === "string" &&
    value?.token_type === "Bearer"
  );
}

async function getAuth0ManagementToken(): Promise<IManagementToken> {
  const data = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT_ID!,
      client_secret: process.env.AUTH0_CLIENT_SECRET!,
      audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
    }),
  });
  const json = await data.json();
  if (!isIAuthTokenResponse(json)) {
    console.log("management token response", JSON.stringify(json));
    throw new Error(
      "auth0-management.fetchFromAuth0Management: invalid management token response"
    );
  }
  console.log(json.scope);
  // TODO: retry
  return {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in,
  };
}

export async function fetchFromAuth0Management(
  path: string,
  init?: Omit<RequestInit, "headers">,
  extraHeaders?: HeadersInit
): Promise<any> {
  if (!path || path[0] === "/") {
    throw new Error(
      "management.fetchFromAuth0Management: Invalid path. Ensure path is a non-empty string and does not start with a /"
    );
  }
  if (!managementTokenPromise) {
    managementTokenPromise = getAuth0ManagementToken();
  }
  let managementToken = await managementTokenPromise;
  if (Date.now() >= managementToken.expiresAt) {
    managementTokenPromise = getAuth0ManagementToken();
  }
  managementToken = await managementTokenPromise;
  return await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/${path}`, {
    ...init,
    headers: {
      ...extraHeaders,
      Authorization: `Bearer ${managementToken.accessToken}`,
    },
  });
}

import { ConfidentialClientApplication } from "@azure/msal-node";

// Creating MSAL client
export const msalClient = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.AAD_CLIENT_ID!,
    clientSecret: process.env.AAD_CLIENT_SECRET!,
  },
});

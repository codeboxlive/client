import msal from "@azure/msal-node";

// Creating MSAL client
export const msalClient = new msal.ConfidentialClientApplication({
  auth: {
    clientId: process.env.AAD_CLIENT_ID!,
    clientSecret: process.env.AAD_CLIENT_SECRET!,
  },
});

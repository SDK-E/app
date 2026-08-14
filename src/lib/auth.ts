import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  ...(process.env.AUTH0_ISSUER_BASE_URL && { issuer: process.env.AUTH0_ISSUER_BASE_URL }),
  ...(process.env.AUTH0_BASE_URL && { appBaseUrl: process.env.AUTH0_BASE_URL }),
});

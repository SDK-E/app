import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { serverEnv } from "./env";

const auth0Domain = serverEnv.AUTH0_ISSUER_BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const auth0 = new Auth0Client({
  domain: auth0Domain,
  appBaseUrl: serverEnv.AUTH0_BASE_URL,
});

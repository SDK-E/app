import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { getServerEnv } from "@/lib/env";

function createAuth0Client() {
  const env = getServerEnv();
  const auth0Domain = env.AUTH0_ISSUER_BASE_URL!.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return new Auth0Client({
    domain: auth0Domain,
    appBaseUrl: env.AUTH0_BASE_URL,
  });
}

let auth0Client: Auth0Client | null = null;

export function getAuth0Client() {
  if (!auth0Client) {
    auth0Client = createAuth0Client();
  }
  return auth0Client;
}

import { createRemoteJWKSet, jwtVerify } from "jose";

let oidcConfig: any = null;
let JWKS: any = null;
let lastFetchTime: number = 0;
const CACHE_TTL = 10 * 60 * 1000;

async function getOidcConfig(issuer: string) {
  const now = Date.now();
  if (oidcConfig && now - lastFetchTime < CACHE_TTL) {
    return oidcConfig;
  }

  const configUrl = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
  const res = await fetch(configUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch OIDC configuration from ${configUrl}`);
  }
  oidcConfig = await res.json();
  lastFetchTime = now;
  JWKS = null;
  return oidcConfig;
}

export async function verifyIdToken(
  idToken: string,
  issuer: string,
  clientId: string,
): Promise<any> {
  const config = await getOidcConfig(issuer);

  if (!JWKS) {
    if (!config.jwks_uri) {
      throw new Error("OIDC configuration is missing jwks_uri");
    }
    JWKS = createRemoteJWKSet(new URL(config.jwks_uri));
  }

  const expectedIssuer = config.issuer || issuer;

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: expectedIssuer,
    audience: clientId,
  });

  return payload;
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = crypto.randomBytes(16).toString("base64url");

  const cookieStore = await cookies();

  cookieStore.set("pkce_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    response_type: "code",
    scope: "openid profile email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(
    `${process.env.IDP_URL}/authorize?${params.toString()}`,
  );
}

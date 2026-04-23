import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error === "access_denied")
    return NextResponse.redirect(`${appUrl}/?error=access_denied`);

  if (!code || !state)
    return NextResponse.redirect(`${appUrl}/?error=invalid_callback`);

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("pkce_verifier")?.value;

  // CSRF check
  if (!storedState || storedState !== state)
    return NextResponse.redirect(`${appUrl}/?error=state_mismatch`);

  if (!codeVerifier)
    return NextResponse.redirect(`${appUrl}/?error=missing_verifier`);

  cookieStore.delete("pkce_verifier");
  cookieStore.delete("oauth_state");

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${appUrl}/api/auth/callback`,
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      code_verifier: codeVerifier,
    });

    const { data } = await axios.post(
      `${process.env.IDP_URL}/token`,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    cookieStore.set("access_token", data.access_token, {
      ...cookieOptions,
      maxAge: 15 * 60,
    });

    cookieStore.set("refresh_token", data.refresh_token, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60,
    });

    cookieStore.set("id_token", data.id_token, {
      ...cookieOptions,
      maxAge: 60 * 60,
    });

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("Token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}/?error=token_exchange_failed`);
  }
}

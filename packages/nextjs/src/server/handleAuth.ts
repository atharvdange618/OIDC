import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { SESSION_COOKIE, encrypt, decrypt } from "./session";
import { generateRandomString, generateCodeChallenge } from "./crypto";

const STATE_COOKIE = "torii_state";
const VERIFIER_COOKIE = "torii_verifier";

function getEnv() {
  const issuer = process.env.NEXT_PUBLIC_TORII_URL;
  const clientId = process.env.TORII_CLIENT_ID;
  const clientSecret = process.env.TORII_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!issuer || !clientId || !clientSecret || !appUrl) {
    throw new Error(
      "Missing Torii environment variables (NEXT_PUBLIC_TORII_URL, TORII_CLIENT_ID, TORII_CLIENT_SECRET, NEXT_PUBLIC_APP_URL).",
    );
  }
  return { issuer, clientId, clientSecret, appUrl };
}

interface HandleAuthOptions {
  scopes?: string[];
}

export function handleAuth(options: HandleAuthOptions = {}) {
  const scopes = options.scopes?.join(" ") || "openid profile email";

  return async function (req: NextRequest) {
    const url = req.nextUrl.clone();
    const path = url.pathname;

    try {
      const { issuer, clientId, clientSecret, appUrl } = getEnv();
      const cookieStore = await cookies();

      if (path.endsWith("/login")) {
        const codeVerifier = generateRandomString(32);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateRandomString(16);

        cookieStore.set(VERIFIER_COOKIE, codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
          path: "/",
        });

        cookieStore.set(STATE_COOKIE, state, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
          path: "/",
        });

        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: `${appUrl}/api/auth/callback`,
          response_type: "code",
          scope: scopes,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        });

        return NextResponse.redirect(
          `${issuer}/authorize?${params.toString()}`,
        );
      }

      if (path.endsWith("/register")) {
        const codeVerifier = generateRandomString(32);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateRandomString(16);

        cookieStore.set(VERIFIER_COOKIE, codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
          path: "/",
        });

        cookieStore.set(STATE_COOKIE, state, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
          path: "/",
        });

        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: `${appUrl}/api/auth/callback`,
          response_type: "code",
          scope: scopes,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          prompt: "create",
        });

        return NextResponse.redirect(
          `${issuer}/authorize?${params.toString()}`,
        );
      }

      if (path.endsWith("/callback")) {
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) return NextResponse.redirect(`${appUrl}/?error=${error}`);
        if (!code || !state)
          return NextResponse.redirect(`${appUrl}/?error=invalid_callback`);

        const storedState = cookieStore.get(STATE_COOKIE)?.value;
        const codeVerifier = cookieStore.get(VERIFIER_COOKIE)?.value;

        if (!storedState || storedState !== state)
          return NextResponse.redirect(`${appUrl}/?error=state_mismatch`);
        if (!codeVerifier)
          return NextResponse.redirect(`${appUrl}/?error=missing_verifier`);

        cookieStore.delete(STATE_COOKIE);
        cookieStore.delete(VERIFIER_COOKIE);

        const tokenParams = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${appUrl}/api/auth/callback`,
          client_id: clientId,
          client_secret: clientSecret,
          code_verifier: codeVerifier,
        });

        const tokenRes = await fetch(`${issuer}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams.toString(),
        });

        if (!tokenRes.ok) {
          throw new Error("Token exchange failed");
        }

        const tokens = await tokenRes.json();

        const user = decodeJwt(tokens.id_token);
        const encryptedSession = await encrypt({
          user,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
        });

        cookieStore.set(SESSION_COOKIE, encryptedSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        return NextResponse.redirect(`${appUrl}/dashboard`);
      }

      if (path.endsWith("/logout")) {
        cookieStore.delete(SESSION_COOKIE);

        const params = new URLSearchParams({
          client_id: clientId,
          post_logout_redirect_uri: `${appUrl}/`,
        });

        return NextResponse.redirect(
          `${issuer}/auth/logout?${params.toString()}`,
        );
      }

      if (path.endsWith("/refresh")) {
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        if (!token) {
          return NextResponse.json(
            { error: "No session found" },
            { status: 401 },
          );
        }

        const session = await decrypt(token);
        if (!session || !session.refreshToken) {
          return NextResponse.json(
            { error: "Invalid session or missing refresh token" },
            { status: 401 },
          );
        }

        const tokenParams = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: session.refreshToken as string,
          client_id: clientId,
          client_secret: clientSecret,
        });

        const tokenRes = await fetch(`${issuer}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams.toString(),
        });

        if (!tokenRes.ok) {
          cookieStore.delete(SESSION_COOKIE);
          return NextResponse.json(
            { error: "Token refresh failed" },
            { status: 401 },
          );
        }

        const tokens = await tokenRes.json();

        const encryptedSession = await encrypt({
          ...session,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || session.refreshToken,
          idToken: tokens.id_token || session.idToken,
        });

        cookieStore.set(SESSION_COOKIE, encryptedSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        return NextResponse.json({
          success: true,
          accessToken: tokens.access_token,
        });
      }

      return NextResponse.json(
        { error: "Route not found in Torii handler" },
        { status: 404 },
      );
    } catch (error: any) {
      console.error("[Torii Auth Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}

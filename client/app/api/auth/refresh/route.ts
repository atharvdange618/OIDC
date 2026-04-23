import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken)
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
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

    return NextResponse.json({ ok: true });
  } catch {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("id_token");
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { data } = await axios.get(`${process.env.IDP_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 401 },
    );
  }
}

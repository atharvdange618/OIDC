import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST() {
  const cookieStore = await cookies();

  try {
    await axios.post(
      `${process.env.IDP_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  } catch {
    // IdP logout failing shouldn't block the client from clearing its own cookies
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("id_token");

  return NextResponse.json({ ok: true });
}

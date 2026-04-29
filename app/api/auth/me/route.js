import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "default_secret_key_12345678");

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ user: payload });

  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "default_secret_key_12345678");

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const users = await query({
      query: "SELECT * FROM users WHERE email = ?",
      values: [email],
    });

    const user = users[0];

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // สร้าง JWT
    const token = await new SignJWT({ id: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    // เก็บใน Cookie
    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ 
      user: { id: user.id, email: user.email, name: user.name } 
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

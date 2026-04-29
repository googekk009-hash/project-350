import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [email],
    });

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await query({
      query: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      values: [name || null, email, hashedPassword],
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

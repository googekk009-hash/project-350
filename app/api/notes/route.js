import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notes = await query({
      query: "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      values: [user.id],
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, mood_color, image_url } = await request.json();
    const result = await query({
      query: "INSERT INTO notes (user_id, title, content, mood_color, image_url) VALUES (?, ?, ?, ?, ?)",
      values: [user.id, title, content, mood_color, image_url || null],
    });
    return NextResponse.json({ id: result.insertId, title, content, mood_color, image_url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

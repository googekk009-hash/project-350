import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const notes = await query({
      query: "SELECT * FROM notes ORDER BY created_at DESC",
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content, mood_color } = await request.json();
    const result = await query({
      query: "INSERT INTO notes (title, content, mood_color) VALUES (?, ?, ?)",
      values: [title, content, mood_color],
    });
    return NextResponse.json({ id: result.insertId, title, content, mood_color });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

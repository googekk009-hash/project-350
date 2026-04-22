import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const { title, content, mood_color } = await request.json();
    await query({
      query: "UPDATE notes SET title = ?, content = ?, mood_color = ? WHERE id = ?",
      values: [title, content, mood_color, id],
    });
    return NextResponse.json({ id, title, content, mood_color });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await query({
      query: "DELETE FROM notes WHERE id = ?",
      values: [id],
    });
    return NextResponse.json({ message: "Note deleted successfully", id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request, { params }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { title, content, mood_color, image_url } = await request.json();
    const result = await query({
      query: "UPDATE notes SET title = ?, content = ?, mood_color = ?, image_url = ? WHERE id = ? AND user_id = ?",
      values: [title, content, mood_color, image_url || null, id, user.id],
    });

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ id, title, content, mood_color, image_url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const result = await query({
      query: "DELETE FROM notes WHERE id = ? AND user_id = ?",
      values: [id, user.id],
    });

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully", id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

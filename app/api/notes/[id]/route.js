import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/notes/:id -> menampilkan satu catatan
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();

    const [rows] = await pool.query(
      "SELECT * FROM notes WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Catatan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil catatan" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/:id -> mengedit catatan
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, collection_id } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Judul catatan wajib diisi" },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [result] = await pool.query(
      `UPDATE notes
       SET title = ?, content = ?, collection_id = ?
       WHERE id = ?`,
      [title.trim(), content || null, collection_id || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Catatan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: Number(id),
      title: title.trim(),
      content: content || null,
      collection_id: collection_id || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengedit catatan" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/:id -> menghapus catatan
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();

    const [result] = await pool.query(
      "DELETE FROM notes WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Catatan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus catatan" },
      { status: 500 }
    );
  }
}

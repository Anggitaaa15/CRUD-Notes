import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/notes -> menampilkan semua catatan
export async function GET() {
  try {
    const pool = getPool();

    const [rows] = await pool.query(`
      SELECT
        notes.id,
        notes.title,
        notes.content,
        notes.collection_id,
        collections.name AS collection_name,
        notes.created_at,
        notes.updated_at
      FROM notes
      LEFT JOIN collections
        ON notes.collection_id = collections.id
      ORDER BY notes.id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data catatan" },
      { status: 500 }
    );
  }
}

// POST /api/notes -> menambahkan catatan
export async function POST(request) {
  try {
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
      `INSERT INTO notes (title, content, collection_id)
       VALUES (?, ?, ?)`,
      [title.trim(), content || null, collection_id || null]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        title: title.trim(),
        content: content || null,
        collection_id: collection_id || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menambahkan catatan" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/collections
// Menampilkan semua koleksi
export async function GET() {
  try {
    const pool = getPool();

    const [rows] = await pool.query(
      "SELECT id, name, created_at FROM collections ORDER BY id DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal mengambil data koleksi" },
      { status: 500 }
    );
  }
}

// POST /api/collections
// Menambahkan koleksi baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama koleksi wajib diisi" },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [result] = await pool.query(
      "INSERT INTO collections (name) VALUES (?)",
      [name.trim()]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        name: name.trim(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal menambahkan koleksi" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/collections/:id

 // GET /api/collections/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();

    const [rows] = await pool.query(
      "SELECT id, name, created_at FROM collections WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET collection error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail koleksi" },
      { status: 500 }
    );
  }
}


// PUT /api/collections/:id
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama koleksi wajib diisi" },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [result] = await pool.query(
      "UPDATE collections SET name = ?, description = ? WHERE id = ?",
      [name.trim(), description?.trim() || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Koleksi berhasil diperbarui",
      id: Number(id),
      name: name.trim(),
      description: description?.trim() || null,
    });
  } catch (error) {
    console.error("PUT collection error:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui koleksi" },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();

    const [result] = await pool.query(
      "DELETE FROM collections WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Koleksi berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE collection error:", error);

    return NextResponse.json(
      { error: "Gagal menghapus koleksi" },
      { status: 500 }
    );
  }
}

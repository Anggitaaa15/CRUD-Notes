
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// PUT /api/collections/:id
// Mengubah nama koleksi
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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
      "UPDATE collections SET name = ? WHERE id = ?",
      [name.trim(), id]
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
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal memperbarui koleksi" },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/:id
// Menghapus koleksi
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
    console.error(error);

    return NextResponse.json(
      { error: "Gagal menghapus koleksi" },
      { status: 500 }
    );
  }
}

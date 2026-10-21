import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/collections/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!/^\d+$/.test(String(id)) || Number(id) < 1) {
      return NextResponse.json(
        { error: "ID koleksi tidak valid." },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT id, name, description, created_at
       FROM collections
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET collection error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail koleksi." },
      { status: 500 }
    );
  }
}

// PUT /api/collections/:id
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!/^\d+$/.test(String(id)) || Number(id) < 1) {
      return NextResponse.json(
        { error: "ID koleksi tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    // Nama wajib diisi
    if (!name) {
      return NextResponse.json(
        { error: "Nama koleksi wajib diisi." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Nama koleksi maksimal 100 karakter." },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Pastikan koleksi tersedia
    const [rows] = await pool.query(
      "SELECT id FROM collections WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Perbarui nama dan deskripsi
    await pool.query(
      `UPDATE collections
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description, id]
    );

    return NextResponse.json({
      message: "Koleksi berhasil diperbarui.",
      id: Number(id),
      name,
      description,
    });
  } catch (error) {
    console.error("PUT collection error:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui koleksi." },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!/^\d+$/.test(String(id)) || Number(id) < 1) {
      return NextResponse.json(
        { error: "ID koleksi tidak valid." },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Pastikan koleksi tersedia
    const [rows] = await pool.query(
      "SELECT id FROM collections WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Koleksi tidak ditemukan." },
        { status: 404 }
      );
    }

    await pool.query(
      "DELETE FROM collections WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      message: "Koleksi berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE collection error:", error);

    return NextResponse.json(
      { error: "Gagal menghapus koleksi." },
      { status: 500 }
    );
  }
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCollectionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Nama koleksi wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambahkan koleksi");
      }

      router.push("/collections");
      router.refresh();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / KOLEKSI</p>
          <h1>Tambah Koleksi</h1>
          <p className="muted">
            Buat koleksi untuk mengelompokkan catatanmu.
          </p>
        </div>
      </header>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <h2>Informasi Koleksi</h2>
            <p className="muted">
              Isi informasi koleksi yang ingin dibuat.
            </p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="name">Nama Koleksi</label>
            <input
              id="name"
              type="text"
              placeholder="Contoh: Pemrograman"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Tuliskan deskripsi koleksi..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-actions">
            <Link
              href="/collections"
              className="secondary-button"
            >
              Batal
            </Link>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Koleksi"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

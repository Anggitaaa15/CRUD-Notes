
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function NoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNote() {
      try {
        const response = await fetch(`/api/notes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengambil catatan");
        }

        setNote(data);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadNote();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="muted">Memuat catatan...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="dashboard-page">
        <p className="error-message">
          {error || "Catatan tidak ditemukan"}
        </p>
        <Link href="/" className="secondary-button">
          Kembali ke Home
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / CATATAN</p>
          <h1>Detail Catatan</h1>
          <p className="muted">Baca isi catatan secara lengkap.</p>
        </div>
      </header>

      <section className="content-panel">
        <span className="collection-tag">
          {note.collection_name || "Tanpa koleksi"}
        </span>

        <h2>{note.title}</h2>

        <p className="muted">
          {note.created_at
            ? new Date(note.created_at).toLocaleDateString("id-ID")
            : "Tanggal tidak tersedia"}
        </p>

        <div className="note-detail-content">
          {note.content || "Tidak ada isi catatan."}
        </div>

        <div className="form-actions">
          <Link href="/" className="secondary-button">
            Kembali
          </Link>

          <button
            className="primary-button"
            onClick={() => router.push(`/notes/${id}/edit`)}
          >
            Edit Catatan
          </button>
        </div>
      </section>
    </div>
  );
}

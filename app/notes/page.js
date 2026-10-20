"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notes");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil catatan");
      }

      setNotes(data);
    } catch (error) {
      setError(error.message || "Gagal mengambil catatan");
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus catatan ini?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus catatan");
      }

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    } catch (error) {
      alert(error.message || "Gagal menghapus catatan");
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / CATATAN</p>
          <h1>Semua Catatan</h1>
          <p className="muted">Kelola semua catatan yang sudah kamu buat.</p>
        </div>

        <Link href="/notes/new" className="primary-button">
          + Tambah Catatan
        </Link>
      </header>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <h2>Daftar Catatan</h2>
            <p className="muted">{notes.length} catatan tersimpan</p>
          </div>
        </div>

        {loading ? (
          <p className="muted">Memuat catatan...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada catatan</h3>
            <p className="muted">
              Tambahkan catatan pertamamu untuk mulai menggunakan Notespace.
            </p>
            <Link href="/notes/new" className="primary-button">
              + Buat Catatan
            </Link>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-header">
                  <span className="note-category">
                    {note.collection_name || "Tanpa Koleksi"}
                  </span>
                </div>

                <h3>{note.title}</h3>

                <p className="note-excerpt">
                  {note.content || "Tidak ada isi catatan."}
                </p>

                <p className="muted">
                  {note.created_at
                    ? new Date(note.created_at).toLocaleDateString("id-ID")
                    : ""}
                </p>

                <div className="note-actions">
                  <Link
                    href={`/notes/${note.id}/edit`}
                    className="secondary-button"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => deleteNote(note.id)}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

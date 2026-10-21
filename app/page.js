"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NoteCard from "./components/NoteCard";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [notesResponse, collectionsResponse] = await Promise.all([
        fetch("/api/notes"),
        fetch("/api/collections"),
      ]);

      const notesData = await notesResponse.json();
      const collectionsData = await collectionsResponse.json();

      if (!notesResponse.ok) {
        throw new Error(notesData.error || "Gagal mengambil catatan");
      }

      if (!collectionsResponse.ok) {
        throw new Error(collectionsData.error || "Gagal mengambil koleksi");
      }

      setNotes(notesData);
      setCollections(collectionsData);
    } catch (error) {
      setError(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
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

      await loadDashboard();
    } catch (error) {
      alert(error.message || "Gagal menghapus catatan");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredNotes = notes.filter((note) =>
    `${note.title} ${note.content || ""} ${note.collection_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const withoutCollection = notes.filter(
    (note) => note.collection_id == null,
  ).length;

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Hi, welcome back!</h1>
          <p className="muted">Kelola ide dan catatanmu di satu tempat.</p>
        </div>

        <div className="topbar-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Cari catatan..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section className="stats-grid">
        <article className="stat-card stat-purple">
          <div className="stat-top">
            <span>Total Catatan</span>
            <span className="stat-icon">▤</span>
          </div>
          <strong>{loading ? "..." : notes.length}</strong>
          <p>Catatan tersimpan</p>
        </article>

        <article className="stat-card stat-pink">
          <div className="stat-top">
            <span>Total Koleksi</span>
            <span className="stat-icon">▣</span>
          </div>
          <strong>{loading ? "..." : collections.length}</strong>
          <p>Koleksi catatanmu</p>
        </article>

        <article className="stat-card stat-yellow">
          <div className="stat-top">
            <span>Tanpa Koleksi</span>
            <span className="stat-icon">◇</span>
          </div>
          <strong>{loading ? "..." : withoutCollection}</strong>
          <p>Catatan belum dikelompokkan</p>
        </article>

        <article className="stat-card stat-blue">
          <div className="stat-top">
            <span>Catatan Terbaru</span>
            <span className="stat-icon">◷</span>
          </div>
          <strong>{loading ? "..." : notes.length ? "Ada" : "0"}</strong>
          <p>Aktivitas catatanmu</p>
        </article>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <h2>Catatan Saya</h2>
            <p className="muted">Semua catatan yang kamu simpan.</p>
          </div>

          <Link href="/notes/new" className="primary-button">
            + Tambah Catatan
          </Link>
        </div>

        {loading && <p className="muted">Memuat catatan...</p>}

        {!loading && !error && filteredNotes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>{search ? "Catatan tidak ditemukan" : "Belum ada catatan"}</h3>
            <p className="muted">
              {search
                ? "Coba kata kunci yang berbeda."
                : "Tambahkan catatan pertamamu untuk mulai mengisi dashboard."}
            </p>
          </div>
        )}

        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      </section>

      <section className="content-panel collection-panel">
        <div className="section-heading">
          <div>
            <h2>Koleksi</h2>
            <p className="muted">Kelompokkan catatan berdasarkan kategori.</p>
          </div>
        </div>

        {collections.length === 0 && !loading && (
          <p className="muted">Belum ada koleksi.</p>
        )}

        <div className="collection-list">
          {collections.slice(0, 5).map((collection, index) => {
            const count = notes.filter(
              (note) => Number(note.collection_id) === Number(collection.id),
            ).length;

            return (
              <article className="collection-item" key={collection.id}>
                <span
                  className={`collection-icon collection-color-${index % 4}`}
                >
                  ▣
                </span>

                <div className="collection-info">
                  <strong>{collection.name}</strong>
                  <span>{count} catatan</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

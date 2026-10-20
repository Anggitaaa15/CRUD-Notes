
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCollections() {
    try {
      setError("");

      const response = await fetch("/api/collections");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil koleksi");
      }

      setCollections(data);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus koleksi "${name}"? Catatan di dalamnya akan dipindahkan ke Tanpa Koleksi jika database menggunakan ON DELETE SET NULL.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus koleksi");
      }

      await loadCollections();
    } catch (err) {
      window.alert(
        err.message || "Terjadi kesalahan saat menghapus koleksi"
      );
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / KOLEKSI</p>
          <h1>Koleksi</h1>
          <p className="muted">
            Kelompokkan catatan agar lebih mudah ditemukan.
          </p>
        </div>

        <Link href="/collections/new" className="primary-button">
          + Tambah Koleksi
        </Link>
      </header>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <h2>Semua Koleksi</h2>
            <p className="muted">
              {collections.length} koleksi tersedia
            </p>
          </div>
        </div>

        {loading ? (
          <p className="muted">Memuat koleksi...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : collections.length === 0 ? (
          <p className="muted">
            Belum ada koleksi. Tambahkan koleksi pertamamu.
          </p>
        ) : (
          <div className="notes-grid">
            {collections.map((collection) => (
              <article className="note-card" key={collection.id}>
                <div className="note-card-top">
                  <span className="note-symbol">▤</span>
                  <span className="collection-tag">Koleksi</span>
                </div>

                <h3>{collection.name}</h3>

                <p className="note-content">
                  {collection.description || "Tidak ada deskripsi."}
                </p>

                <div className="note-actions">
                  <Link
                    href={`/collections/${collection.id}/edit`}
                    className="secondary-button"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/collections/${collection.id}`}
                    className="secondary-button"
                  >
                    Lihat Catatan
                  </Link>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleDelete(collection.id, collection.name)
                    }
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

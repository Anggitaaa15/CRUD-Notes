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

      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
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
            Belum ada koleksi. Tambahkan koleksi melalui sidebar.
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
                    href={`/collections/${collection.id}`}
                    className="secondary-button"
                  >
                    Lihat Catatan
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

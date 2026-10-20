
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewNotePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCollections() {
      try {
        const response = await fetch("/api/collections");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengambil koleksi");
        }

        setCollections(data);
      } catch (error) {
        setError(error.message || "Gagal mengambil koleksi");
      }
    }

    loadCollections();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Judul catatan wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          collection_id: collectionId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan catatan");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / CATATAN</p>
          <h1>Tambah Catatan</h1>
          <p className="muted">
            Tulis ide dan simpan catatanmu di sini.
          </p>
        </div>
      </header>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <h2>Informasi Catatan</h2>
            <p className="muted">
              Isi informasi berikut untuk membuat catatan baru.
            </p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="title">Judul Catatan</label>
            <input
              id="title"
              type="text"
              placeholder="Contoh: Ide project website"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Isi Catatan</label>
            <textarea
              id="content"
              placeholder="Tulis isi catatanmu di sini..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="collection">Koleksi</label>
            <select
              id="collection"
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
            >
              <option value="">Tanpa koleksi</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <Link href="/" className="secondary-button">
              Batal
            </Link>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

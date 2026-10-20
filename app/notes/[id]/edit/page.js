
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditNotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [noteResponse, collectionsResponse] = await Promise.all([
          fetch(`/api/notes/${id}`),
          fetch("/api/collections"),
        ]);

        const noteData = await noteResponse.json();
        const collectionsData = await collectionsResponse.json();

        if (!noteResponse.ok) {
          throw new Error(noteData.error || "Gagal mengambil catatan");
        }

        if (!collectionsResponse.ok) {
          throw new Error(
            collectionsData.error || "Gagal mengambil koleksi"
          );
        }

        setTitle(noteData.title || "");
        setContent(noteData.content || "");
        setCollectionId(
          noteData.collection_id == null
            ? ""
            : String(noteData.collection_id)
        );
        setCollections(collectionsData);
      } catch (error) {
        setError(error.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Judul catatan wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
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
        throw new Error(data.error || "Gagal mengedit catatan");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="muted">Memuat catatan...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / CATATAN</p>
          <h1>Edit Catatan</h1>
          <p className="muted">
            Ubah informasi catatanmu di sini.
          </p>
        </div>
      </header>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <h2>Informasi Catatan</h2>
            <p className="muted">
              Perbarui informasi yang ingin kamu ubah.
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
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Isi Catatan</label>
            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(event) => setContent(event.target.value)}
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
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

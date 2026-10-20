
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NoteCard from "@/app/components/NoteCard";


export default function CollectionDetailPage() {
  const { id } = useParams();

  const [collection, setCollection] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [collectionRes, notesRes] = await Promise.all([
          fetch(`/api/collections/${id}`),
          fetch("/api/notes"),
        ]);

        const collectionData = await collectionRes.json();
        const notesData = await notesRes.json();

        if (!collectionRes.ok) {
          throw new Error(
            collectionData.error || "Gagal mengambil koleksi"
          );
        }

        if (!notesRes.ok) {
          throw new Error(
            notesData.error || "Gagal mengambil catatan"
          );
        }

        setCollection(collectionData);

        const filteredNotes = notesData.filter(
          (note) => Number(note.collection_id) === Number(id)
        );

        setNotes(filteredNotes);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  async function handleDelete(noteId) {
    if (!window.confirm("Yakin ingin menghapus catatan ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus catatan");
      }

      setNotes((currentNotes) =>
        currentNotes.filter(
          (note) => Number(note.id) !== Number(noteId)
        )
      );
    } catch (err) {
      window.alert(err.message || "Gagal menghapus catatan");
    }
  }

  if (loading) {
    return <main className="dashboard-page">Memuat koleksi...</main>;
  }

  if (error) {
    return <main className="dashboard-page">{error}</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="page-heading">
        <div>
          <Link href="/" className="back-link">
            ← Kembali ke Home
          </Link>

          <h1>{collection?.name}</h1>

          <p>
            {notes.length} catatan dalam koleksi ini
          </p>
        </div>

        <Link href="/notes/new" className="primary-button">
          + Buat Catatan
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <h3>Belum ada catatan</h3>
          <p>
            Catatan yang dimasukkan ke koleksi ini akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}


"use client";

import Link from "next/link";

export default function NoteCard({ note, onDelete }) {
  return (
    <article className="note-card">
      <Link
        href={`/notes/${note.id}`}
        className="note-detail-link"
      >
        <div className="note-card-top">
          <span className="note-symbol">▤</span>
          <span className="collection-tag">
            {note.collection_name || "Tanpa koleksi"}
          </span>
        </div>

        <h3>{note.title}</h3>

        <p className="note-content">
          {note.content || "Tidak ada isi catatan."}
        </p>
      </Link>

      <div className="note-card-footer">
        <span>
          {note.created_at
            ? new Date(note.created_at).toLocaleDateString("id-ID")
            : "Tanggal tidak tersedia"}
        </span>
        <span>ID #{note.id}</span>
      </div>

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
          onClick={() => onDelete(note.id)}
        >
          Hapus
        </button>
      </div>
    </article>
  );
}

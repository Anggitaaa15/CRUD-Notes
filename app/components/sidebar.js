"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Home", href: "/", icon: "▦" },
  { label: "Semua Catatan", href: "/notes", icon: "▤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collections, setCollections] = useState([]);
  const [notes, setNotes] = useState([]);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [expandedCollections, setExpandedCollections] = useState({});

  // State modal edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");

  // State proses dan pesan
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Mengambil data koleksi dan catatan
  async function loadSidebarData() {
    try {
      const [collectionsResponse, notesResponse] = await Promise.all([
        fetch("/api/collections"),
        fetch("/api/notes"),
      ]);

      if (!collectionsResponse.ok || !notesResponse.ok) {
        throw new Error("Gagal mengambil data sidebar.");
      }

      const collectionsData = await collectionsResponse.json();
      const notesData = await notesResponse.json();

      setCollections(
        Array.isArray(collectionsData) ? collectionsData : []
      );

      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (error) {
      console.error("Gagal memuat sidebar:", error);
      setErrorMessage("Gagal memuat data koleksi dan catatan.");
    }
  }

  useEffect(() => {
    loadSidebarData();
  }, [pathname]);

  // Membuka dan menutup koleksi
  function toggleCollection(id) {
    setExpandedCollections((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }

  // Membuka modal edit
  function openEditModal(collection) {
    setSelectedCollection(collection);
    setCollectionName(collection.name || "");
    setCollectionDescription(collection.description || "");
    setErrorMessage("");
    setSuccessMessage("");
    setEditModalOpen(true);
  }

  // Menutup modal edit
  function closeEditModal() {
    if (saving) return;

    setEditModalOpen(false);
    setSelectedCollection(null);
    setCollectionName("");
    setCollectionDescription("");
    setErrorMessage("");
  }

  // Menyimpan perubahan nama dan deskripsi koleksi
  async function handleEditCollection(event) {
    event.preventDefault();

    if (!selectedCollection) return;

    const trimmedName = collectionName.trim();
    const trimmedDescription = collectionDescription.trim();

    if (!trimmedName) {
      setErrorMessage("Nama koleksi wajib diisi.");
      return;
    }

    if (trimmedName.length > 100) {
      setErrorMessage("Nama koleksi maksimal 100 karakter.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/collections/${selectedCollection.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            description: trimmedDescription,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Gagal memperbarui koleksi."
        );
      }

      // Perbarui nama dan deskripsi di sidebar
      setCollections((previous) =>
        previous.map((collection) =>
          Number(collection.id) === Number(selectedCollection.id)
            ? {
                ...collection,
                name: data.name ?? trimmedName,
                description:
                  data.description ?? (trimmedDescription || null),
              }
            : collection
        )
      );

      setSuccessMessage("Koleksi berhasil diperbarui.");
      setEditModalOpen(false);
      setSelectedCollection(null);
      setCollectionName("");
      setCollectionDescription("");
    } catch (error) {
      setErrorMessage(
        error.message || "Terjadi kesalahan saat mengedit koleksi."
      );
    } finally {
      setSaving(false);
    }
  }

  // Menghapus koleksi
  async function handleDeleteCollection(collection) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus koleksi "${collection.name}"?\n\nCatatan di dalam koleksi ini tidak akan ikut dihapus, tetapi tidak lagi terhubung dengan koleksi tersebut.`
    );

    if (!confirmed) return;

    setDeletingId(collection.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/collections/${collection.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Gagal menghapus koleksi."
        );
      }

      // Hapus koleksi dari sidebar
      setCollections((previous) =>
        previous.filter(
          (item) => Number(item.id) !== Number(collection.id)
        )
      );

      // Catatan tetap ada, tetapi tidak terhubung ke koleksi
      setNotes((previous) =>
        previous.map((note) =>
          Number(note.collection_id) === Number(collection.id)
            ? { ...note, collection_id: null }
            : note
        )
      );

      setExpandedCollections((previous) => {
        const updated = { ...previous };
        delete updated[collection.id];
        return updated;
      });

      setSuccessMessage(
        `Koleksi "${collection.name}" berhasil dihapus.`
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Terjadi kesalahan saat menghapus koleksi."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <aside className="sidebar">
        <Link href="/" className="sidebar-logo">
          <span className="logo-icon">N</span>
          <span>Notespace</span>
        </Link>

        <p className="menu-label">MENU</p>

        <nav className="sidebar-menu">
          {menus.map((menu) => {
            const active =
              menu.href === "/"
                ? pathname === "/"
                : pathname === "/notes" ||
                  pathname.startsWith("/notes/");

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <span className="menu-icon">{menu.icon}</span>
                <span>{menu.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            className="sidebar-link sidebar-dropdown-button"
            onClick={() =>
              setCollectionsOpen((previous) => !previous)
            }
            aria-expanded={collectionsOpen}
          >
            <span className="menu-icon">▣</span>
            <span className="sidebar-dropdown-label">Koleksi</span>
            <span className="dropdown-arrow">
              {collectionsOpen ? "⌄" : "›"}
            </span>
          </button>

          {collectionsOpen && (
            <div className="sidebar-nested">
              {collections.map((collection) => {
                const collectionNotes = notes.filter(
                  (note) =>
                    Number(note.collection_id) ===
                    Number(collection.id)
                );

                const expanded = Boolean(
                  expandedCollections[collection.id]
                );

                return (
                  <div
                    key={collection.id}
                    className="sidebar-collection"
                  >
                    <div className="sidebar-collection-row">
                      <button
                        type="button"
                        className="sidebar-link sidebar-collection-link"
                        onClick={() => toggleCollection(collection.id)}
                        aria-expanded={expanded}
                        title={collection.name}
                      >
                        <span className="dropdown-arrow">
                          {expanded ? "⌄" : "›"}
                        </span>

                        <span className="menu-icon">▣</span>

                        <span className="sidebar-item-name">
                          {collection.name}
                        </span>
                      </button>

                      <div className="collection-actions">
                        <button
                          type="button"
                          className="collection-action-btn edit-collection-btn"
                          title="Edit koleksi"
                          aria-label={`Edit koleksi ${collection.name}`}
                          onClick={() => openEditModal(collection)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="collection-action-btn delete-collection-btn"
                          title="Hapus koleksi"
                          aria-label={`Hapus koleksi ${collection.name}`}
                          disabled={deletingId === collection.id}
                          onClick={() =>
                            handleDeleteCollection(collection)
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="m19 6-1 14H6L5 6" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="sidebar-note-list">
                        {collectionNotes.length > 0 ? (
                          collectionNotes.map((note) => (
                            <Link
                              key={note.id}
                              href={`/notes/${note.id}`}
                              className={`sidebar-link sidebar-note-link ${
                                pathname === `/notes/${note.id}`
                                  ? "active"
                                  : ""
                              }`}
                              title={note.title}
                            >
                              <span className="menu-icon">▤</span>

                              <span className="sidebar-item-name">
                                {note.title}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <p className="sidebar-empty">
                            Belum ada catatan
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/collections/new"
                className="sidebar-link sidebar-add-collection"
              >
                <span className="menu-icon">+</span>
                <span>Tambah Koleksi</span>
              </Link>
            </div>
          )}
        </nav>

        {successMessage && (
          <div className="sidebar-feedback success">
            <span>{successMessage}</span>
            <button
              type="button"
              aria-label="Tutup pesan"
              onClick={() => setSuccessMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && !editModalOpen && (
          <div className="sidebar-feedback error">
            <span>{errorMessage}</span>
            <button
              type="button"
              aria-label="Tutup pesan"
              onClick={() => setErrorMessage("")}
            >
              ×
            </button>
          </div>
        )}
      </aside>

      {/* Modal Edit Koleksi */}
      {editModalOpen && selectedCollection && (
        <div
          className="collection-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div
            className="collection-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-collection-title"
          >
            <div className="collection-modal-header">
              <div>
                <h2 id="edit-collection-title">Edit Koleksi</h2>
                <p>Ubah nama atau deskripsi koleksi.</p>
              </div>

              <button
                type="button"
                className="collection-modal-close"
                aria-label="Tutup modal"
                disabled={saving}
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleEditCollection}
              className="collection-modal-form"
            >
              <label htmlFor="collection-name">
                Nama Koleksi <span aria-hidden="true">*</span>
              </label>

              <input
                id="collection-name"
                type="text"
                value={collectionName}
                onChange={(event) =>
                  setCollectionName(event.target.value)
                }
                placeholder="Masukkan nama koleksi"
                maxLength={100}
                autoFocus
                required
                disabled={saving}
              />

              <label htmlFor="collection-description">
                Deskripsi <span className="muted">(Opsional)</span>
              </label>

              <textarea
                id="collection-description"
                value={collectionDescription}
                onChange={(event) =>
                  setCollectionDescription(event.target.value)
                }
                placeholder="Tambahkan deskripsi koleksi..."
                rows={4}
                disabled={saving}
              />

              {errorMessage && (
                <p className="collection-modal-error">
                  {errorMessage}
                </p>
              )}

              <div className="collection-modal-actions">
                <button
                  type="button"
                  className="collection-modal-cancel"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="collection-modal-save"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

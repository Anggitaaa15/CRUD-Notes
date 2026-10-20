
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

  useEffect(() => {
    async function loadSidebarData() {
      try {
        const [collectionsResponse, notesResponse] = await Promise.all([
          fetch("/api/collections"),
          fetch("/api/notes"),
        ]);

        if (!collectionsResponse.ok || !notesResponse.ok) {
          throw new Error("Gagal mengambil data sidebar");
        }

        const collectionsData = await collectionsResponse.json();
        const notesData = await notesResponse.json();

        setCollections(
          Array.isArray(collectionsData) ? collectionsData : []
        );
        setNotes(Array.isArray(notesData) ? notesData : []);
      } catch (error) {
        console.error("Gagal memuat sidebar:", error);
      }
    }

    loadSidebarData();
  }, [pathname]);

  function toggleCollection(id) {
    setExpandedCollections((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }

  return (
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
              : pathname === "/notes";

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
          onClick={() => setCollectionsOpen((previous) => !previous)}
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
                  Number(note.collection_id) === Number(collection.id)
              );

              const expanded = Boolean(
                expandedCollections[collection.id]
              );

              return (
                <div key={collection.id} className="sidebar-collection">
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
    </aside>
  );
}

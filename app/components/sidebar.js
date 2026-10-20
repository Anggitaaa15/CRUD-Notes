
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Home", href: "/", icon: "▦" },
  { label: "Semua Catatan", href: "/notes", icon: "▤" },
  { label: "Koleksi", href: "/collections", icon: "▣" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
              : pathname === menu.href ||
                pathname.startsWith(menu.href + "/");

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
      </nav>

      <div className="sidebar-bottom">
        <p className="menu-label">LAINNYA</p>
        <Link href="/" className="sidebar-link">
          <span className="menu-icon">⚙</span>
          <span>Pengaturan</span>
        </Link>
      </div>
    </aside>
  );
}

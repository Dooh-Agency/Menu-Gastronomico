"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ publicMenuHref }: { publicMenuHref?: string }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Menú" },
    { href: "/admin/categories", label: "Categorías" },
    { href: "/admin/items", label: "Platos" },
    { href: "/admin/settings", label: "Configuración" },
    { href: "/admin/users", label: "Equipo" },
  ];



  return (
    <nav className="admin-nav" aria-label="Administración">
      {links.map((link) => {
        const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "is-active" : ""}
            href={link.href}
            key={link.href}
            prefetch={true}
          >
            {link.label}
          </Link>
        );
      })}
      {publicMenuHref ? (
        <Link href={publicMenuHref} prefetch={false} target="_blank">
          Ver menú público
        </Link>
      ) : null}
    </nav>
  );
}


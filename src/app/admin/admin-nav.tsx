"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ publicMenuHref }: { publicMenuHref?: string }) {
  const pathname = usePathname();
  const links = [{ href: "/admin", label: "Resumen" }, { href: "/admin/categories", label: "Categorías" }, { href: "/admin/items", label: "Platos" }, { href: "/admin/settings", label: "Configuración" }, { href: "/admin/users", label: "Equipo" }];
  return <nav className="admin-nav" aria-label="Administración">{links.map((link) => <Link aria-current={pathname === link.href ? "page" : undefined} className={pathname === link.href ? "is-active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}{publicMenuHref ? <Link href={publicMenuHref} target="_blank">Ver menú público</Link> : null}</nav>;
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  restaurantName: string;
  publicMenuHref?: string;
  logoUrl?: string;
  signOutAction: () => Promise<void>;
}

export function AdminHeader({
  restaurantName,
  publicMenuHref,
  logoUrl,
  signOutAction,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen]);

  // Determine active tab for center nav
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const isCartasActive = !isSettingsActive && !pathname.startsWith("/admin/users");
  const isEquipoActive = pathname.startsWith("/admin/users");

  const initial = restaurantName ? restaurantName.charAt(0).toUpperCase() : "R";

  return (
    <header className="admin-header-unified">
      {/* Left: Public Menu Link */}
      <div className="admin-header-left">
        {publicMenuHref ? (
          <a
            href={publicMenuHref}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-public-menu-btn"
            title="Abrir menú público"
          >
            <span className="public-live-indicator" aria-hidden="true" />
            <span className="public-menu-text">Ver menú</span>
            <svg
              className="public-menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : (
          <span className="admin-brand-logo">{restaurantName}</span>
        )}
      </div>

      {/* Center: Equal-sized Main Tabs */}
      <nav className="admin-header-center-nav" aria-label="Navegación principal">
        <Link
          href="/admin"
          className={`admin-nav-tab ${isCartasActive ? "is-active" : ""}`}
          aria-current={isCartasActive ? "page" : undefined}
          prefetch={true}
        >
          <svg
            className="tab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Cartas</span>
        </Link>

        <Link
          href="/admin/settings"
          className={`admin-nav-tab ${isSettingsActive ? "is-active" : ""}`}
          aria-current={isSettingsActive ? "page" : undefined}
          prefetch={true}
        >
          <svg
            className="tab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Configuración</span>
        </Link>
      </nav>

      {/* Right: Restaurant Profile & User Menu Popover */}
      <div className="admin-header-right" ref={dropdownRef}>
        <button
          type="button"
          className={`admin-profile-trigger ${dropdownOpen ? "is-active" : ""}`}
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="Menú de usuario y restaurante"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={restaurantName} className="admin-profile-avatar-img" />
          ) : (
            <span className="admin-profile-avatar-fallback">{initial}</span>
          )}
          <svg
            className={`admin-profile-chevron ${dropdownOpen ? "is-open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="admin-profile-dropdown" role="menu">
            <div className="dropdown-header">
              <span className="dropdown-restaurant-name">{restaurantName}</span>
              <span className="dropdown-badge">Administración</span>
            </div>

            <div className="dropdown-divider" />

            <Link
              href="/admin/users"
              className={`dropdown-item ${isEquipoActive ? "is-active" : ""}`}
              onClick={() => setDropdownOpen(false)}
              role="menuitem"
            >
              <svg
                className="dropdown-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Equipo</span>
            </Link>

            <div className="dropdown-divider" />

            <form action={signOutAction} className="dropdown-form">
              <button type="submit" className="dropdown-item dropdown-item-danger" role="menuitem">
                <svg
                  className="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

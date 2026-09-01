"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreateMenuDialog, EditMenuDialog, MenuBannerDialog, MenuSchedulesDialog } from "./menu-dialogs";
import { deleteMenu } from "./actions";
import { menuImageUrl } from "@/lib/restaurant-branding";
import type { Category, Menu, MenuItem, RestaurantData } from "./types";

type MenusDashboardProps = {
  restaurant: RestaurantData;
  menus: Menu[];
  categories: Category[];
  items: MenuItem[];
  onSelectMenu: (menuId: string) => void;
};

function formatScheduleSummary(menu: Menu) {
  if (!menu.schedules || menu.schedules.length === 0) {
    return "Disponible todo el día";
  }
  if (menu.schedules.length === 1) {
    const s = menu.schedules[0];
    const start = s.starts_at.slice(0, 5);
    const end = s.ends_at.slice(0, 5);
    if (start === "00:00" && (end === "23:59" || end === "00:00")) {
      return "Disponible todo el día";
    }
    const daysLabel =
      s.day_of_week === null
        ? "Todos los días"
        : s.day_of_week === 1
        ? "Lunes"
        : s.day_of_week === 2
        ? "Martes"
        : s.day_of_week === 3
        ? "Miércoles"
        : s.day_of_week === 4
        ? "Jueves"
        : s.day_of_week === 5
        ? "Viernes"
        : s.day_of_week === 6
        ? "Sábado"
        : "Domingo";
    return `${daysLabel} (${start} - ${end})`;
  }
  return `${menu.schedules.length} franjas horarias`;
}

export function MenusDashboard({
  restaurant,
  menus,
  categories,
  items,
  onSelectMenu,
}: MenusDashboardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingSchedulesMenu, setEditingSchedulesMenu] = useState<Menu | null>(null);
  const [editingBannerMenu, setEditingBannerMenu] = useState<Menu | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(menu: Menu) {
    if (menus.length <= 1) {
      alert("No podés eliminar la única carta del restaurante.");
      return;
    }

    const menuCategories = categories.filter((c) => c.menu_id === menu.id);
    const menuCategoryIds = new Set(menuCategories.map((c) => c.id));
    const menuItems = items.filter((i) => menuCategoryIds.has(i.category_id));

    const confirmMsg =
      menuCategories.length > 0
        ? `¿Eliminar la carta "${menu.name}"? Contiene ${menuCategories.length} categoría(s) y ${menuItems.length} plato(s) que también se eliminarán.`
        : `¿Eliminar la carta "${menu.name}"?`;

    if (!confirm(confirmMsg)) return;

    const formData = new FormData();
    formData.set("menu_id", menu.id);
    startTransition(async () => {
      await deleteMenu(formData);
    });
  }

  const defaultCover = (restaurant.branding as Record<string, unknown>)?.cover_image_path as string | null ?? null;

  return (
    <div className="admin-menus-dashboard">
      {/* Header del Dashboard */}
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-header-left">
          <div className="admin-dashboard-tag">Panel de Cartas</div>
          <h1 className="admin-dashboard-title">Cartas de {restaurant.name}</h1>
          <p className="admin-dashboard-subtitle">
            Seleccioná una carta para modificar sus platos, categorías y horarios, o creá una nueva.
          </p>
        </div>

        <div className="admin-dashboard-header-actions">
          <Link
            className="secondary-link"
            href={`/${restaurant.slug}`}
            rel="noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ver menú comensal
          </Link>
          <button
            className="primary-button"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="16"
            >
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            Crear nueva carta
          </button>
        </div>
      </header>

      {/* Grilla de Cartas */}
      <div className="admin-menus-grid">
        {menus.map((menu) => {
          const menuCategories = categories.filter((c) => c.menu_id === menu.id);
          const menuCategoryIds = new Set(menuCategories.map((c) => c.id));
          const menuItemsCount = items.filter((i) => menuCategoryIds.has(i.category_id)).length;
          const scheduleSummary = formatScheduleSummary(menu);
          const bannerSrc = menu.banner_path || defaultCover;

          return (
            <div
              key={menu.id}
              className={`admin-menu-card ${!menu.is_active ? "is-inactive" : ""}`}
            >
              {/* Banner de la Carta */}
              <div
                className="admin-menu-card-cover"
                onClick={() => onSelectMenu(menu.id)}
                role="button"
                tabIndex={0}
              >
                {bannerSrc ? (
                  <Image
                    alt={menu.name}
                    className="admin-menu-card-image"
                    fill
                    sizes="(max-width: 48rem) 100vw, (max-width: 72rem) 50vw, 33vw"
                    src={menuImageUrl(bannerSrc)}
                  />
                ) : (
                  <div className="admin-menu-card-placeholder-banner">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="32"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="32"
                    >
                      <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}

                <div className="admin-menu-card-badges">
                  {menu.is_active ? (
                    <span className="admin-badge-active">● Activa</span>
                  ) : (
                    <span className="admin-badge-inactive">Oculta</span>
                  )}
                </div>

                <div className="admin-menu-card-hover-overlay">
                  <span className="admin-menu-card-enter-btn">Entrar a modificar →</span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="admin-menu-card-body">
                <div className="admin-menu-card-info">
                  <h2
                    className="admin-menu-card-name"
                    onClick={() => onSelectMenu(menu.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {menu.name}
                  </h2>
                  {menu.description && (
                    <p className="admin-menu-card-desc">{menu.description}</p>
                  )}
                </div>

                <div className="admin-menu-card-meta-list">
                  <div className="admin-menu-card-meta-item">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="15"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="15"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{scheduleSummary}</span>
                  </div>

                  <div className="admin-menu-card-meta-item">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="15"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="15"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>
                      {menuCategories.length} {menuCategories.length === 1 ? "categoría" : "categorías"} ·{" "}
                      {menuItemsCount} {menuItemsCount === 1 ? "plato" : "platos"}
                    </span>
                  </div>
                </div>

                <div className="admin-menu-card-actions">
                  <button
                    className="primary-button admin-menu-open-btn"
                    onClick={() => onSelectMenu(menu.id)}
                    type="button"
                  >
                    Modificar carta
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="15"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      width="15"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <div className="admin-menu-card-btn-group">
                    <button
                      className="icon-button"
                      onClick={() => setEditingMenu(menu)}
                      title="Editar nombre y descripción"
                      type="button"
                    >
                      <svg
                        fill="none"
                        height="15"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="15"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>

                    <button
                      className="icon-button"
                      onClick={() => setEditingSchedulesMenu(menu)}
                      title="Configurar horarios"
                      type="button"
                    >
                      <svg
                        fill="none"
                        height="15"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="15"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </button>

                    <button
                      className="icon-button"
                      onClick={() => setEditingBannerMenu(menu)}
                      title="Cambiar foto de portada"
                      type="button"
                    >
                      <svg
                        fill="none"
                        height="15"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="15"
                      >
                        <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </button>

                    {menus.length > 1 && (
                      <button
                        className="icon-button icon-button-danger"
                        disabled={isPending}
                        onClick={() => handleDelete(menu)}
                        title="Eliminar carta"
                        type="button"
                      >
                        <svg
                          fill="none"
                          height="15"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="15"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Tarjeta para crear nueva carta */}
        <button
          className="admin-create-menu-card"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <div className="admin-create-menu-card-content">
            <div className="admin-create-menu-plus-icon" aria-hidden="true">
              <svg
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                width="24"
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
            </div>
            <strong>Crear nueva carta</strong>
            <p>Para mediodías, cenas, barra de tragos, desayunos o eventos especiales.</p>
          </div>
        </button>
      </div>

      {/* Modales */}
      <CreateMenuDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newId) => onSelectMenu(newId)}
      />

      {editingMenu && (
        <EditMenuDialog
          isOpen={true}
          menu={editingMenu}
          onClose={() => setEditingMenu(null)}
        />
      )}

      {editingSchedulesMenu && (
        <MenuSchedulesDialog
          isOpen={true}
          menu={editingSchedulesMenu}
          onClose={() => setEditingSchedulesMenu(null)}
          schedules={editingSchedulesMenu.schedules || []}
        />
      )}

      {editingBannerMenu && (
        <MenuBannerDialog
          isOpen={true}
          menu={editingBannerMenu}
          onClose={() => setEditingBannerMenu(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { CreateMenuDialog, EditMenuDialog } from "./menu-dialogs";
import { deleteMenu } from "./actions";
import type { Category, Menu, MenuItem } from "./types";

type MenusSidebarProps = {
  menus: Menu[];
  selectedMenuId: string;
  onSelectMenu: (menuId: string) => void;
  categories: Category[];
  items: MenuItem[];
};

function formatScheduleSummary(menu: Menu) {
  if (!menu.schedules || menu.schedules.length === 0) {
    return "Todo el día";
  }
  if (menu.schedules.length === 1) {
    const s = menu.schedules[0];
    const start = s.starts_at.slice(0, 5);
    const end = s.ends_at.slice(0, 5);
    if (start === "00:00" && (end === "23:59" || end === "00:00")) {
      return "Todo el día";
    }
    return `${start} - ${end}`;
  }
  return `${menu.schedules.length} franjas`;
}

export function MenusSidebar({
  menus,
  selectedMenuId,
  onSelectMenu,
  categories,
  items,
}: MenusSidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
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
      if (selectedMenuId === menu.id) {
        const remaining = menus.filter((m) => m.id !== menu.id);
        if (remaining.length > 0) {
          onSelectMenu(remaining[0].id);
        }
      }
    });
  }

  return (
    <aside className="admin-menus-sidebar" aria-label="Gestión de cartas">
      <div className="admin-menus-sidebar-header">
        <div className="admin-menus-sidebar-title-group">
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="18"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h3>Mis Cartas</h3>
        </div>
        <span className="admin-menus-sidebar-badge">{menus.length}</span>
      </div>

      <p className="admin-menus-sidebar-hint">
        Crea distintas cartas para momentos del día o especialidades.
      </p>

      <div className="admin-menus-list">
        {menus.map((menu) => {
          const isSelected = menu.id === selectedMenuId;
          const menuCategories = categories.filter((c) => c.menu_id === menu.id);
          const menuCategoryIds = new Set(menuCategories.map((c) => c.id));
          const menuItemsCount = items.filter((i) => menuCategoryIds.has(i.category_id)).length;
          const scheduleSummary = formatScheduleSummary(menu);

          return (
            <div
              key={menu.id}
              className={`admin-menu-sidebar-card ${isSelected ? "is-selected" : ""} ${
                !menu.is_active ? "is-inactive" : ""
              }`}
            >
              <button
                className="admin-menu-sidebar-select-btn"
                onClick={() => onSelectMenu(menu.id)}
                type="button"
              >
                <div className="admin-menu-sidebar-card-top">
                  <span className="admin-menu-sidebar-name">{menu.name}</span>
                  {!menu.is_active && (
                    <span className="admin-menu-inactive-tag">Inactiva</span>
                  )}
                </div>

                <div className="admin-menu-sidebar-card-meta">
                  <span className="admin-menu-sidebar-schedule">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="12"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {scheduleSummary}
                  </span>
                  <span className="admin-menu-sidebar-count">
                    {menuCategories.length} cat. · {menuItemsCount} platos
                  </span>
                </div>
              </button>

              <div className="admin-menu-sidebar-card-actions">
                <button
                  className="admin-menu-action-icon-btn"
                  onClick={() => setEditingMenu(menu)}
                  title="Editar detalles de la carta"
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="14"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="14"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>

                {menus.length > 1 && (
                  <button
                    className="admin-menu-action-icon-btn btn-danger"
                    disabled={isPending}
                    onClick={() => handleDelete(menu)}
                    title="Eliminar carta"
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="14"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="14"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="primary-button admin-create-menu-btn"
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
    </aside>
  );
}

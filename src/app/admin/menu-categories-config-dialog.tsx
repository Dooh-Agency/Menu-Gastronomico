"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminDialog } from "./admin-dialog";
import type { Category, Menu, MenuItem } from "./types";

type MenuCategoriesConfigDialogProps = {
  menu: Menu;
  categories: Category[];
  items: MenuItem[];
  allMenus: Menu[];
  onClose: () => void;
  onEditCategory: (category: Category) => void;
  onUnlinkCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onAddCategory: () => void;
  onReorder: (newCategories: Category[]) => Promise<void>;
};

export function MenuCategoriesConfigDialog({
  menu,
  categories,
  items,
  allMenus,
  onClose,
  onEditCategory,
  onUnlinkCategory,
  onDeleteCategory,
  onAddCategory,
  onReorder,
}: MenuCategoriesConfigDialogProps) {
  const [prevCategories, setPrevCategories] = useState(categories);
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  if (categories !== prevCategories) {
    setPrevCategories(categories);
    setCategoriesList(categories);
  }

  async function handleReorderCommit(newList: Category[]) {
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        await onReorder(newList);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2200);
      } catch (err) {
        console.error("Error al reordenar categorías:", err);
        setSaveStatus("idle");
      }
    });
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, id: string) {
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>, id: string) {
    event.preventDefault();
    if (draggedId && draggedId !== id && dragOverId !== id) {
      setDragOverId(id);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>, id: string) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    if (dragOverId === id) {
      setDragOverId(null);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const currentList = [...categoriesList];
    const fromIndex = currentList.findIndex((c) => c.id === draggedId);
    const toIndex = currentList.findIndex((c) => c.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      return;
    }

    const [movedItem] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, movedItem);

    setCategoriesList(currentList);
    setDraggedId(null);
    void handleReorderCommit(currentList);
  }

  function handleMoveStep(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categoriesList.length) return;

    const currentList = [...categoriesList];
    const [moved] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, moved);

    setCategoriesList(currentList);
    void handleReorderCommit(currentList);
  }

  return (
    <AdminDialog maxWidth="50rem" onClose={onClose}>
      <div className="menu-categories-config-modal">
        {/* Encabezado del Modal */}
        <div className="modal-header-section" style={{ paddingBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: "var(--color-secondary, #f3e5df)",
                color: "var(--color-accent, #ae4c2c)",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
              }}
            >
              Carta: {menu.name}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {saveStatus === "saving" ? (
                <span className="save-indicator is-saving">Guardando orden...</span>
              ) : saveStatus === "saved" ? (
                <span className="save-indicator is-saved">✓ Orden guardado</span>
              ) : null}

              <button
                className="admin-config-add-btn"
                onClick={() => {
                  onClose();
                  onAddCategory();
                }}
                title="Agregar o vincular una nueva categoría a esta carta"
                type="button"
              >
                <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="15">
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
                Agregar categoría
              </button>
            </div>
          </div>

          <h2 className="modal-title" style={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}>
            Configuración de Categorías
          </h2>
          <p className="modal-description" style={{ marginBottom: "0.25rem" }}>
            Arrastrá las filas con <strong>⠿</strong> para definir el orden en esta carta, o editalas y borralas una por una.
          </p>
        </div>

        {/* Lista de Categorías */}
        {categoriesList.length === 0 ? (
          <div className="admin-empty-categories-card" style={{ margin: "1rem 0" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                background: "var(--color-secondary, #f3e5df)",
                color: "var(--color-accent, #ae4c2c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.75rem",
              }}
            >
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem" }}>Esta carta aún no tiene categorías</h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-muted)" }}>
              Creá una categoría nueva o vinculá una existente para empezar a organizar los platos de &quot;{menu.name}&quot;.
            </p>
            <button
              className="primary-link"
              onClick={() => {
                onClose();
                onAddCategory();
              }}
              type="button"
            >
              + Agregar primera categoría
            </button>
          </div>
        ) : (
          <div className="config-categories-list" role="list">
            {categoriesList.map((category, index) => {
              const dishCount = items.filter((i) => i.category_id === category.id).length;
              const isShared = (category.menu_ids?.length ?? 1) > 1;
              const sharedCount = category.menu_ids?.length ?? 1;
              const layoutType = category.card_layout || "rectangle";
              const isFirst = index === 0;
              const isLast = index === categoriesList.length - 1;

              return (
                <div
                  aria-grabbed={draggedId === category.id}
                  className={`config-category-row ${draggedId === category.id ? "is-dragging" : ""} ${
                    dragOverId === category.id ? "is-drag-over" : ""
                  }`}
                  draggable
                  key={category.id}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDragLeave={(e) => handleDragLeave(e, category.id)}
                  onDragOver={(e) => handleDragOver(e, category.id)}
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDrop={(e) => handleDrop(e, category.id)}
                  role="listitem"
                >
                  {/* Control Drag & Drop y Flechas Accesibles */}
                  <div className="config-row-drag-controls">
                    <span
                      aria-hidden="true"
                      className="config-drag-handle"
                      title="Arrastrar para reordenar"
                    >
                      ⠿
                    </span>
                    <div className="config-stepper-controls">
                      <button
                        aria-label={`Mover categoría ${category.name} hacia arriba`}
                        className="config-stepper-btn"
                        disabled={isFirst || isPending}
                        onClick={() => handleMoveStep(index, -1)}
                        title="Subir una posición"
                        type="button"
                      >
                        ▲
                      </button>
                      <button
                        aria-label={`Mover categoría ${category.name} hacia abajo`}
                        className="config-stepper-btn"
                        disabled={isLast || isPending}
                        onClick={() => handleMoveStep(index, 1)}
                        title="Bajar una posición"
                        type="button"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Número de orden en la carta */}
                  <div className="config-order-number" title={`Posición #${index + 1} en esta carta`}>
                    {index + 1}
                  </div>

                  {/* Información principal de la categoría */}
                  <div className="config-category-info">
                    <div className="config-category-title-line">
                      <strong className="config-category-name">{category.name}</strong>

                      {/* Badge del Formato de Tarjeta (Tipo de UI) */}
                      <span className={`config-layout-badge badge-${layoutType}`}>
                        {layoutType === "hero"
                          ? "Cuadrado grande"
                          : layoutType === "carousel"
                          ? "Scroll horizontal"
                          : "Rectángulo"}
                      </span>

                      {/* Badge de Estado */}
                      {!category.is_active ? (
                        <span className="status-badge is-inactive" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                          Pausada
                        </span>
                      ) : null}

                      {/* Badge de Platos */}
                      <span className="config-dishes-badge">
                        {dishCount} {dishCount === 1 ? "plato" : "platos"}
                      </span>

                      {/* Badge de Cartas Compartidas */}
                      {isShared ? (
                        <span
                          className="config-shared-badge"
                          title={`Esta categoría también se utiliza en otras ${sharedCount - 1} carta${sharedCount - 1 === 1 ? "" : "s"}`}
                        >
                          <svg fill="none" height="11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="11">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          En {sharedCount} cartas
                        </span>
                      ) : null}
                    </div>

                    {category.description ? (
                      <p className="config-category-desc">{category.description}</p>
                    ) : null}
                  </div>

                  {/* Acciones de la fila (Editar, Quitar, Borrar) */}
                  <div className="config-row-actions">
                    <button
                      aria-label={`Editar categoría ${category.name}`}
                      className="config-action-btn config-btn-edit"
                      onClick={() => onEditCategory(category)}
                      title="Editar categoría y formato de tarjetas"
                      type="button"
                    >
                      <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      <span>Editar</span>
                    </button>

                    <button
                      aria-label={`Quitar categoría ${category.name} de esta carta`}
                      className="config-action-btn config-btn-unlink"
                      disabled={isPending}
                      onClick={() => onUnlinkCategory(category)}
                      title="Quitar de esta carta (los platos seguirán disponibles en el restaurante)"
                      type="button"
                    >
                      <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                        <line x1="18" x2="6" y1="6" y2="18" />
                        <line x1="6" x2="18" y1="6" y2="18" />
                      </svg>
                      <span>Quitar</span>
                    </button>

                    <button
                      aria-label={`Eliminar categoría ${category.name} definitivamente`}
                      className="config-action-btn config-btn-delete"
                      disabled={isPending}
                      onClick={() => onDeleteCategory(category)}
                      title="Eliminar definitivamente del restaurante y todas las cartas"
                      type="button"
                    >
                      <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Acciones de cierre del modal */}
        <div className="admin-modal-actions" style={{ marginTop: "1.5rem", borderTop: "1px solid #e7e1d8", paddingTop: "1rem" }}>
          <button className="primary-link" onClick={onClose} type="button">
            Listo
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}

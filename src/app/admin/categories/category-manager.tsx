"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDialog } from "../admin-dialog";
import { createCategory, deleteCategory, reorderCategories, updateCategory } from "../actions";
import { LocalizationFields } from "../localization-fields";
import { CardLayoutSelector, type CardLayoutType } from "./card-layout-selector";

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  card_layout?: "rectangle" | "hero" | "carousel";
  menu_ids?: string[];
  menu_category_translations?: Array<{ locale: string; name: string; description: string | null }>;
};

type Daypart = { id: string; name: string };
type MenuInfo = { id: string; name: string };

export function CategoryManager({
  categories: initialCategories,
  dayparts,
  locales,
  menus = [],
}: {
  categories: Category[];
  dayparts?: Daypart[];
  locales: string[];
  menus?: MenuInfo[];
}) {
  const [prevCategories, setPrevCategories] = useState(initialCategories);
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  // Wizard state for Create Dialog
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [createCardLayout, setCreateCardLayout] = useState<CardLayoutType>("rectangle");
  const [createName, setCreateName] = useState("");
  const [createNameError, setCreateNameError] = useState(false);

  // Wizard state for Edit Dialog
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [editCardLayout, setEditCardLayout] = useState<CardLayoutType>("rectangle");
  const [editName, setEditName] = useState("");
  const [editNameError, setEditNameError] = useState(false);

  if (initialCategories !== prevCategories) {
    setPrevCategories(initialCategories);
    setCategories(initialCategories);
  }

  function startCreate() {
    setIsCreateDialogOpen(true);
    setCreateStep(1);
    setCreateCardLayout("rectangle");
    setCreateName("");
    setCreateNameError(false);
  }

  function startEditing(cat: Category) {
    setEditingCategory(cat);
    setEditStep(1);
    setEditCardLayout(cat.card_layout || "rectangle");
    setEditName(cat.name);
    setEditNameError(false);
  }

  function moveCategory(destinationId: string) {
    if (!draggedCategoryId || draggedCategoryId === destinationId) return;

    const nextCategories = [...categories];
    const fromIndex = nextCategories.findIndex(({ id }) => id === draggedCategoryId);
    const destinationIndex = nextCategories.findIndex(({ id }) => id === destinationId);
    if (fromIndex < 0 || destinationIndex < 0) return;

    const [movedCategory] = nextCategories.splice(fromIndex, 1);
    nextCategories.splice(destinationIndex, 0, movedCategory);
    setCategories(nextCategories);

    const formData = new FormData();
    formData.set("category_ids", nextCategories.map(({ id }) => id).join(","));
    void reorderCategories(formData);
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Menú</p>
          <h1>Categorías</h1>
          <p className="admin-intro">Organizá las secciones y el formato de tarjetas que se muestran en tu menú.</p>
        </div>
        <button className="primary-link" onClick={startCreate} type="button">
          Agregar categoría
        </button>
      </div>

      {/* MODAL: CREAR CATEGORÍA */}
      {isCreateDialogOpen ? (
        <AdminDialog maxWidth="44rem" onClose={() => setIsCreateDialogOpen(false)}>
          <form
            action={createCategory}
            className="admin-modal-form"
            onSubmit={() => setIsCreateDialogOpen(false)}
          >
            {/* 1- FOTO / HEADER VISUAL */}
            <div className="modal-hero-photo-section">
              <div
                style={{
                  background: "linear-gradient(135deg, #823718 0%, #b85d3b 100%)",
                  borderRadius: "0.75rem",
                  padding: "1.2rem 1.4rem",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    borderRadius: "50%",
                    padding: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
                    Sección del menú · Paso {createStep} de 2
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                    {createStep === 1 ? "Información básica" : "Formato de tarjetas"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <button
                onClick={() => setCreateStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: createStep === 1 ? "2px solid var(--color-accent)" : "2px solid transparent",
                  color: createStep === 1 ? "var(--color-accent)" : "var(--color-muted)",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: createStep === 1 ? 700 : 500,
                  padding: "0.35rem 0.75rem",
                }}
                type="button"
              >
                1. Información básica
              </button>
              <button
                onClick={() => {
                  if (!createName.trim()) {
                    setCreateNameError(true);
                    return;
                  }
                  setCreateNameError(false);
                  setCreateStep(2);
                }}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: createStep === 2 ? "2px solid var(--color-accent)" : "2px solid transparent",
                  color: createStep === 2 ? "var(--color-accent)" : "var(--color-muted)",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: createStep === 2 ? 700 : 500,
                  padding: "0.35rem 0.75rem",
                }}
                type="button"
              >
                2. Formato de tarjetas
              </button>
            </div>

            {/* PASO 1: DATOS GENERALES */}
            <div style={{ display: createStep === 1 ? "flex" : "none", flexDirection: "column", gap: "1rem" }}>
              <div className="modal-header-section">
                <p className="eyebrow">Paso 1 · Datos de la categoría</p>
                <h2 className="modal-title">Crear categoría</h2>
                <p className="modal-description">
                  Definí el nombre, descripción y en qué cartas querés mostrar esta categoría.
                </p>
              </div>

              <label>
                Nombre
                <input
                  autoFocus
                  name="name"
                  onChange={(e) => {
                    setCreateName(e.target.value);
                    if (e.target.value.trim()) setCreateNameError(false);
                  }}
                  placeholder="Ej: Hamburguesas, Pastas, Postres..."
                  required
                  value={createName}
                />
                {createNameError ? (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    El nombre de la categoría es obligatorio para avanzar.
                  </span>
                ) : null}
              </label>

              <label>
                Descripción <span className="field-optional">Opcional</span>
                <input name="description" placeholder="Breve detalle de esta sección..." />
              </label>

              {menus.length ? (
                <fieldset className="daypart-fields">
                  <legend>Cartas donde se muestra</legend>
                  <p>Seleccioná en qué cartas querés que aparezca esta categoría.</p>
                  <input name="has_menu_selection" type="hidden" value="1" />
                  {menus.map((menu) => (
                    <label className="checkbox-label" key={menu.id}>
                      <input name="menu_ids" type="checkbox" value={menu.id} />
                      {menu.name}
                    </label>
                  ))}
                </fieldset>
              ) : null}

              <LocalizationFields locales={locales} translations={[]} />

              <div className="admin-modal-actions">
                <button className="secondary-link" onClick={() => setIsCreateDialogOpen(false)} type="button">
                  Cancelar
                </button>
                <button
                  className="primary-link"
                  onClick={() => {
                    if (!createName.trim()) {
                      setCreateNameError(true);
                      return;
                    }
                    setCreateNameError(false);
                    setCreateStep(2);
                  }}
                  type="button"
                >
                  Siguiente: Formato de tarjetas →
                </button>
              </div>
            </div>

            {/* PASO 2: FORMATO DE TARJETAS */}
            <div style={{ display: createStep === 2 ? "flex" : "none", flexDirection: "column", gap: "1rem" }}>
              <div className="modal-header-section">
                <p className="eyebrow">Paso 2 · Formato visual</p>
                <h2 className="modal-title">Elegí el diseño de las tarjetas</h2>
                <p className="modal-description">
                  Seleccioná cómo se presentarán los platos de <strong>{createName || "esta categoría"}</strong> en el menú público.
                </p>
              </div>

              <CardLayoutSelector
                name="card_layout"
                onChange={setCreateCardLayout}
                value={createCardLayout}
              />

              <div className="admin-modal-actions">
                <button className="secondary-link" onClick={() => setCreateStep(1)} type="button">
                  ← Volver a información
                </button>
                <button className="primary-link" type="submit">
                  Crear categoría
                </button>
              </div>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {/* MODAL: EDITAR CATEGORÍA */}
      {editingCategory ? (
        <AdminDialog maxWidth="44rem" onClose={() => setEditingCategory(null)}>
          <form
            action={updateCategory}
            className="admin-modal-form"
            onSubmit={() => setEditingCategory(null)}
          >
            <input name="category_id" type="hidden" value={editingCategory.id} />
            <input name="sort_order" type="hidden" value={categories.findIndex(({ id }) => id === editingCategory.id)} />

            {/* 1- FOTO / HEADER VISUAL */}
            <div className="modal-hero-photo-section">
              <div
                style={{
                  background: "linear-gradient(135deg, #823718 0%, #b85d3b 100%)",
                  borderRadius: "0.75rem",
                  padding: "1.2rem 1.4rem",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    borderRadius: "50%",
                    padding: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
                    Sección del menú · Paso {editStep} de 2
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                    Editar {editingCategory.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <button
                onClick={() => setEditStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: editStep === 1 ? "2px solid var(--color-accent)" : "2px solid transparent",
                  color: editStep === 1 ? "var(--color-accent)" : "var(--color-muted)",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: editStep === 1 ? 700 : 500,
                  padding: "0.35rem 0.75rem",
                }}
                type="button"
              >
                1. Información básica
              </button>
              <button
                onClick={() => {
                  if (!editName.trim()) {
                    setEditNameError(true);
                    return;
                  }
                  setEditNameError(false);
                  setEditStep(2);
                }}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: editStep === 2 ? "2px solid var(--color-accent)" : "2px solid transparent",
                  color: editStep === 2 ? "var(--color-accent)" : "var(--color-muted)",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: editStep === 2 ? 700 : 500,
                  padding: "0.35rem 0.75rem",
                }}
                type="button"
              >
                2. Formato de tarjetas
              </button>
            </div>

            {/* PASO 1: DATOS GENERALES */}
            <div style={{ display: editStep === 1 ? "flex" : "none", flexDirection: "column", gap: "1rem" }}>
              <div className="modal-header-section">
                <p className="eyebrow">Paso 1 · Datos de la categoría</p>
                <h2 className="modal-title">{editingCategory.name}</h2>
                <p className="modal-description">
                  Actualizá los datos que se mostrarán en el menú público.
                </p>
              </div>

              <label>
                Nombre
                <input
                  autoFocus
                  defaultValue={editingCategory.name}
                  name="name"
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (e.target.value.trim()) setEditNameError(false);
                  }}
                  required
                />
                {editNameError ? (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    El nombre de la categoría es obligatorio.
                  </span>
                ) : null}
              </label>

              <label>
                Descripción <span className="field-optional">Opcional</span>
                <input defaultValue={editingCategory.description ?? ""} name="description" />
              </label>

              <label className="checkbox-label">
                <input defaultChecked={editingCategory.is_active} name="is_active" type="checkbox" />
                <span>Activa</span>
              </label>

              {menus.length ? (
                <fieldset className="daypart-fields">
                  <legend>Cartas donde se muestra</legend>
                  <p>Seleccioná en qué cartas querés que aparezca esta categoría.</p>
                  <input name="has_menu_selection" type="hidden" value="1" />
                  {menus.map((menu) => (
                    <label className="checkbox-label" key={menu.id}>
                      <input
                        defaultChecked={editingCategory.menu_ids?.includes(menu.id)}
                        name="menu_ids"
                        type="checkbox"
                        value={menu.id}
                      />
                      {menu.name}
                    </label>
                  ))}
                </fieldset>
              ) : null}

              <LocalizationFields locales={locales} translations={editingCategory.menu_category_translations ?? []} />

              <div className="admin-modal-actions">
                <button className="secondary-link" onClick={() => setEditingCategory(null)} type="button">
                  Cancelar
                </button>
                <button
                  className="primary-link"
                  onClick={() => {
                    if (!editName.trim()) {
                      setEditNameError(true);
                      return;
                    }
                    setEditNameError(false);
                    setEditStep(2);
                  }}
                  type="button"
                >
                  Siguiente: Formato de tarjetas →
                </button>
              </div>
            </div>

            {/* PASO 2: FORMATO DE TARJETAS */}
            <div style={{ display: editStep === 2 ? "flex" : "none", flexDirection: "column", gap: "1rem" }}>
              <div className="modal-header-section">
                <p className="eyebrow">Paso 2 · Formato visual</p>
                <h2 className="modal-title">Elegí el diseño de las tarjetas</h2>
                <p className="modal-description">
                  Podés modificar cómo se muestran los platos para esta categoría en el menú de tus clientes.
                </p>
              </div>

              <CardLayoutSelector
                name="card_layout"
                onChange={setEditCardLayout}
                value={editCardLayout}
              />

              <div className="admin-modal-actions">
                <button className="secondary-link" onClick={() => setEditStep(1)} type="button">
                  ← Volver a información
                </button>
                <button className="primary-link" type="submit">
                  Guardar cambios
                </button>
              </div>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      <section className="admin-section category-section">
        <p className="admin-intro">Arrastrá una fila desde el control de puntos para definir el orden del menú.</p>
        <div className="admin-editor-list" role="list">
          {categories.map((category) => (
            <div
              className="category-row"
              draggable
              key={category.id}
              onDragEnd={() => setDraggedCategoryId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={() => setDraggedCategoryId(category.id)}
              onDrop={() => moveCategory(category.id)}
              role="listitem"
            >
              <span aria-hidden="true" className="drag-handle" title="Arrastrar para reordenar">
                ⠿
              </span>
              <div className="category-details">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <strong>{category.name}</strong>

                  {/* Formato de tarjeta Badge */}
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      background:
                        category.card_layout === "hero"
                          ? "#fef3c7"
                          : category.card_layout === "carousel"
                          ? "#e0e7ff"
                          : "#f3f4f6",
                      color:
                        category.card_layout === "hero"
                          ? "#92400e"
                          : category.card_layout === "carousel"
                          ? "#3730a3"
                          : "#4b5563",
                    }}
                  >
                    {category.card_layout === "hero"
                      ? "Cuadrado grande"
                      : category.card_layout === "carousel"
                      ? "Scroll horizontal"
                      : "Rectángulo"}
                  </span>

                  {category.menu_ids && category.menu_ids.length > 0 && menus && menus.length > 0 ? (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: category.menu_ids.length > 1 ? "rgba(59, 130, 246, 0.12)" : "rgba(107, 114, 128, 0.12)",
                        color: category.menu_ids.length > 1 ? "#2563eb" : "#4b5563",
                      }}
                    >
                      {category.menu_ids.map((mid) => menus.find((m) => m.id === mid)?.name).filter(Boolean).join(", ") || "En cartas"}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: "rgba(245, 158, 11, 0.12)",
                        color: "#b45309",
                      }}
                    >
                      Sin carta asignada
                    </span>
                  )}
                </div>
                {category.description ? <p>{category.description}</p> : <p className="empty-row-detail">Sin descripción</p>}
              </div>
              <span className={`status-badge${category.is_active ? "" : " is-inactive"}`}>
                {category.is_active ? "Activa" : "Inactiva"}
              </span>
              <div className="row-actions">
                <Link
                  aria-label={`Ver platos de ${category.name}`}
                  className="icon-button"
                  href={`/admin/items?category=${category.id}`}
                  prefetch={true}
                  title="Ver platos de esta categoría"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    restaurant_menu
                  </span>
                </Link>
                <button
                  aria-label={`Editar ${category.name}`}
                  className="icon-button"
                  onClick={() => startEditing(category)}
                  title="Editar categoría"
                  type="button"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    edit
                  </span>
                </button>
                <form action={deleteCategory}>
                  <input name="category_id" type="hidden" value={category.id} />
                  <button
                    aria-label={`Eliminar ${category.name}`}
                    className="icon-button icon-button-danger"
                    onClick={(event) => {
                      if (!window.confirm(`¿Eliminar la categoría “${category.name}” y los platos que contiene?`))
                        event.preventDefault();
                    }}
                    title="Eliminar categoría"
                    type="submit"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined">
                      delete
                    </span>
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

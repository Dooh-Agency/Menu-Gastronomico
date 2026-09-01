"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDialog } from "../admin-dialog";
import { createCategory, deleteCategory, reorderCategories, updateCategory } from "../actions";
import { LocalizationFields } from "../localization-fields";

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  menu_category_translations?: Array<{ locale: string; name: string; description: string | null }>;
  menu_category_dayparts?: Array<{ daypart_id: string }>;
};

type Daypart = { id: string; name: string };

export function CategoryManager({ categories: initialCategories, dayparts, locales }: { categories: Category[]; dayparts: Daypart[]; locales: string[] }) {
  const [prevCategories, setPrevCategories] = useState(initialCategories);
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  if (initialCategories !== prevCategories) {
    setPrevCategories(initialCategories);
    setCategories(initialCategories);
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
          <p className="admin-intro">Organizá las secciones que se muestran en tu menú.</p>
        </div>
        <button className="primary-link" onClick={() => setIsCreateDialogOpen(true)} type="button">
          Agregar categoría
        </button>
      </div>

      {isCreateDialogOpen ? (
        <AdminDialog onClose={() => setIsCreateDialogOpen(false)}>
          <form action={createCategory} className="admin-modal-form" onSubmit={() => setIsCreateDialogOpen(false)}>
            <div>
              <p className="eyebrow">Nueva categoría</p>
              <h2>Crear categoría</h2>
              <p>Podés cambiar sus datos y su posición después.</p>
            </div>
            <label>
              Nombre
              <input autoFocus name="name" required />
            </label>
            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input name="description" />
            </label>
            {dayparts.length ? (
              <fieldset className="daypart-fields">
                <legend>Cartas donde se muestra</legend>
                <p>Si no elegís ninguna, la categoría aparece en todas las cartas.</p>
                {dayparts.map((daypart) => (
                  <label className="checkbox-label" key={daypart.id}>
                    <input name="daypart_ids" type="checkbox" value={daypart.id} />
                    {daypart.name}
                  </label>
                ))}
              </fieldset>
            ) : null}
            <LocalizationFields locales={locales} translations={[]} />
            <div className="admin-modal-actions">
              <button className="secondary-link" onClick={() => setIsCreateDialogOpen(false)} type="button">
                Cancelar
              </button>
              <button className="primary-link" type="submit">
                Crear categoría
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {editingCategory ? (
        <AdminDialog onClose={() => setEditingCategory(null)}>
          <form action={updateCategory} className="admin-modal-form" onSubmit={() => setEditingCategory(null)}>
            <input name="category_id" type="hidden" value={editingCategory.id} />
            <input name="sort_order" type="hidden" value={categories.findIndex(({ id }) => id === editingCategory.id)} />
            <div>
              <p className="eyebrow">Editar categoría</p>
              <h2>{editingCategory.name}</h2>
              <p>Actualizá los datos que se mostrarán en el menú público.</p>
            </div>
            <label>
              Nombre
              <input autoFocus defaultValue={editingCategory.name} name="name" required />
            </label>
            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input defaultValue={editingCategory.description ?? ""} name="description" />
            </label>
            <label className="checkbox-label">
              <input defaultChecked={editingCategory.is_active} name="is_active" type="checkbox" />
              Activa
            </label>
            {dayparts.length ? (
              <fieldset className="daypart-fields">
                <legend>Cartas donde se muestra</legend>
                <p>Si no elegís ninguna, la categoría aparece en todas las cartas.</p>
                {dayparts.map((daypart) => (
                  <label className="checkbox-label" key={daypart.id}>
                    <input
                      defaultChecked={editingCategory.menu_category_dayparts?.some((item) => item.daypart_id === daypart.id)}
                      name="daypart_ids"
                      type="checkbox"
                      value={daypart.id}
                    />
                    {daypart.name}
                  </label>
                ))}
              </fieldset>
            ) : null}
            <LocalizationFields locales={locales} translations={editingCategory.menu_category_translations ?? []} />
            <div className="admin-modal-actions">
              <button className="secondary-link" onClick={() => setEditingCategory(null)} type="button">
                Cancelar
              </button>
              <button className="primary-link" type="submit">
                Guardar cambios
              </button>
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
                <strong>{category.name}</strong>
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
                  onClick={() => setEditingCategory(category)}
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


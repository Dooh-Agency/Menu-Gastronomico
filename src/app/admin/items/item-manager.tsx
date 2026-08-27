"use client";

import { useMemo, useState } from "react";
import { AdminDialog } from "../admin-dialog";
import { createMenuItem, deleteMenuItem, reorderMenuItems, updateMenuItem } from "../actions";

type Category = { id: string; name: string };
type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  is_available: boolean;
  sort_order: number;
};

export function ItemManager({ categories, items }: { categories: Category[]; items: Item[] }) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const visibleItems = useMemo(() => selectedCategoryId === "all" ? orderedItems : orderedItems.filter((item) => item.category_id === selectedCategoryId), [orderedItems, selectedCategoryId]);

  function moveItem(destinationId: string) {
    if (selectedCategoryId === "all" || !draggedItemId || draggedItemId === destinationId) return;
    const reorderedItems = [...visibleItems];
    const fromIndex = reorderedItems.findIndex(({ id }) => id === draggedItemId);
    const destinationIndex = reorderedItems.findIndex(({ id }) => id === destinationId);
    if (fromIndex < 0 || destinationIndex < 0) return;

    const [movedItem] = reorderedItems.splice(fromIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);
    const queuedItems = [...reorderedItems];
    setOrderedItems((currentItems) => currentItems.map((item) => item.category_id === selectedCategoryId ? queuedItems.shift()! : item));

    const formData = new FormData();
    formData.set("category_id", selectedCategoryId);
    formData.set("item_ids", reorderedItems.map(({ id }) => id).join(","));
    void reorderMenuItems(formData);
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Menú</p>
          <h1>Platos</h1>
          <p className="admin-intro">Editá los platos de tu carta y definí cuándo están disponibles.</p>
        </div>
        <button className="primary-link" disabled={!categories.length} onClick={() => setIsCreateDialogOpen(true)} title={categories.length ? undefined : "Primero agregá una categoría"} type="button">
          Agregar plato
        </button>
      </div>

      {!categories.length ? <p className="empty-state">Primero creá una categoría para poder agregar platos.</p> : null}

      {isCreateDialogOpen ? (
        <AdminDialog onClose={() => setIsCreateDialogOpen(false)}>
          <form action={createMenuItem} className="admin-modal-form" onSubmit={() => setIsCreateDialogOpen(false)}>
            <div>
              <p className="eyebrow">Nuevo plato</p>
              <h2>Agregar plato</h2>
              <p>Completá los datos esenciales; después podés ajustarlos desde la lista.</p>
            </div>
            <label>Nombre<input autoFocus name="name" required /></label>
            <label>Descripción <span className="field-optional">Opcional</span><input name="description" /></label>
            <div className="admin-modal-grid">
              <label>Precio (ARS)<input min="0" name="price" required step=".01" type="number" /></label>
              <label>Categoría<select name="category_id">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            </div>
            <label className="checkbox-label"><input defaultChecked name="is_available" type="checkbox" />Disponible</label>
            <div className="admin-modal-actions">
              <button className="secondary-link" onClick={() => setIsCreateDialogOpen(false)} type="button">Cancelar</button>
              <button className="primary-link" type="submit">Agregar plato</button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {editingItem ? (
        <AdminDialog onClose={() => setEditingItem(null)}>
          <form action={updateMenuItem} className="admin-modal-form" onSubmit={() => setEditingItem(null)}>
            <input name="item_id" type="hidden" value={editingItem.id} />
            <div>
              <p className="eyebrow">Editar plato</p>
              <h2>{editingItem.name}</h2>
              <p>Los cambios se verán reflejados en el menú público.</p>
            </div>
            <label>Nombre<input autoFocus defaultValue={editingItem.name} name="name" required /></label>
            <label>Descripción <span className="field-optional">Opcional</span><input defaultValue={editingItem.description ?? ""} name="description" /></label>
            <div className="admin-modal-grid">
              <label>Precio (ARS)<input defaultValue={(editingItem.price_cents / 100).toFixed(2)} min="0" name="price" required step=".01" type="number" /></label>
              <label>Categoría<select defaultValue={editingItem.category_id} name="category_id">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            </div>
            <div className="admin-modal-grid">
              <input name="sort_order" type="hidden" value={editingItem.sort_order} />
              <label className="checkbox-label"><input defaultChecked={editingItem.is_available} name="is_available" type="checkbox" />Disponible</label>
            </div>
            <div className="admin-modal-actions">
              <button className="secondary-link" onClick={() => setEditingItem(null)} type="button">Cancelar</button>
              <button className="primary-link" type="submit">Guardar cambios</button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {categories.length ? (
        <section className="admin-section item-section">
          <div className="admin-section-heading">
            <div>
              <h2>Platos actuales</h2>
              <p>{visibleItems.length} {visibleItems.length === 1 ? "plato" : "platos"} {selectedCategoryId === "all" ? "en total" : "en esta categoría"}.</p>
            </div>
            <label className="item-filter">
              <span>Filtrar por categoría</span>
              <select aria-label="Filtrar platos por categoría" onChange={(event) => setSelectedCategoryId(event.target.value)} value={selectedCategoryId}>
                <option value="all">Todas las categorías</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>

          {visibleItems.length ? (
            <div className="admin-editor-list" role="list">
              {visibleItems.map((item) => (
                <div className="item-row" draggable={selectedCategoryId !== "all"} key={item.id} onDragEnd={() => setDraggedItemId(null)} onDragOver={(event) => event.preventDefault()} onDragStart={() => setDraggedItemId(item.id)} onDrop={() => moveItem(item.id)} role="listitem">
                  {selectedCategoryId !== "all" ? <span aria-hidden="true" className="drag-handle" title="Arrastrar para reordenar">⠿</span> : null}
                  <div className="item-details">
                    <strong>{item.name}</strong>
                    {item.description ? <p>{item.description}</p> : <p className="empty-row-detail">Sin descripción</p>}
                  </div>
                  <strong className="item-price">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(item.price_cents / 100)}</strong>
                  <span className="item-category-display">{categories.find((category) => category.id === item.category_id)?.name ?? "Sin categoría"}</span>
                  {selectedCategoryId !== "all" ? <span className="item-order">Orden {item.sort_order}</span> : null}
                  <span className={`availability-status${item.is_available ? "" : " is-inactive"}`}>{item.is_available ? "Disponible" : "No disponible"}</span>
                  <div className="row-actions">
                    <button aria-label={`Editar ${item.name}`} className="icon-button" onClick={() => setEditingItem(item)} title="Editar plato" type="button"><span aria-hidden="true" className="material-symbols-outlined">edit</span></button>
                    <form action={deleteMenuItem}>
                      <input name="item_id" type="hidden" value={item.id} />
                      <button aria-label={`Eliminar ${item.name}`} className="icon-button icon-button-danger" onClick={(event) => { if (!window.confirm(`¿Eliminar el plato “${item.name}”?`)) event.preventDefault(); }} title="Eliminar plato" type="submit"><span aria-hidden="true" className="material-symbols-outlined">delete</span></button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="empty-state">No hay platos en esta categoría.</p>}
        </section>
      ) : null}
    </>
  );
}

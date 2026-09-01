"use client";

import { useState, useTransition } from "react";
import { AdminDialog } from "./admin-dialog";
import {
  createMenu,
  saveMenuSchedules,
  updateMenu,
  updateMenuBanner,
} from "./actions";
import type { Menu, MenuSchedule } from "./types";

const DAYS_OF_WEEK = [
  { value: "all", label: "Todos los días" },
  { value: "weekdays", label: "Lunes a Viernes" },
  { value: "weekends", label: "Sábados y Domingos" },
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
];

export function CreateMenuDialog({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newMenuId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<"all_day" | "custom">("all_day");
  const [daysSelection, setDaysSelection] = useState<string>("all");
  const [startsAt, setStartsAt] = useState("12:00");
  const [endsAt, setEndsAt] = useState("23:30");

  if (!isOpen) return null;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setBannerPreview(URL.createObjectURL(file));
    else setBannerPreview(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("schedule_type", scheduleType);
    formData.set("days_selection", daysSelection);
    formData.set("starts_at", startsAt);
    formData.set("ends_at", endsAt);

    startTransition(async () => {
      const res = await createMenu(formData);
      onClose();
      setBannerPreview(null);
      if (res?.menuId && onCreated) {
        onCreated(res.menuId);
      }
    });
  }

  return (
    <AdminDialog
      onClose={() => {
        setBannerPreview(null);
        onClose();
      }}
    >
      <form className="admin-modal-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Nueva carta</p>
          <h2>Crear nueva carta</h2>
          <p>Creá una carta independiente con su propio banner, nombre, horarios y platos.</p>
        </div>

        <label>
          Nombre de la carta
          <input
            autoFocus
            name="name"
            placeholder="Ej: Menú Ejecutivo, Carta de Vinos, Desayunos..."
            required
            type="text"
          />
        </label>

        <label>
          Descripción <span className="field-optional">Opcional</span>
          <textarea
            name="description"
            placeholder="Breve reseña o aclaración sobre esta carta..."
            rows={2}
          />
        </label>

        <label>
          Foto de cabecera / Banner de la carta <span className="field-optional">JPG, PNG o WebP; máx 5 MB</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            name="banner_image"
            onChange={handleFileChange}
            type="file"
          />
        </label>

        {bannerPreview && (
          <div className="admin-image-preview-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Previsualización" className="admin-banner-preview-img" src={bannerPreview} />
          </div>
        )}

        <div className="admin-form-divider" />

        <div>
          <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.35rem" }}>
            Disponibilidad horaria
          </p>
          <div className="admin-radio-group">
            <label className="admin-radio-label">
              <input
                checked={scheduleType === "all_day"}
                name="schedule_mode"
                onChange={() => setScheduleType("all_day")}
                type="radio"
                value="all_day"
              />
              <span>Disponible todo el día</span>
            </label>
            <label className="admin-radio-label">
              <input
                checked={scheduleType === "custom"}
                name="schedule_mode"
                onChange={() => setScheduleType("custom")}
                type="radio"
                value="custom"
              />
              <span>Horarios específicos</span>
            </label>
          </div>
        </div>

        {scheduleType === "custom" && (
          <div className="admin-schedules-list">
            <label>
              Días disponible
              <select
                onChange={(e) => setDaysSelection(e.target.value)}
                value={daysSelection}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form-row">
              <label>
                Desde
                <input
                  onChange={(e) => setStartsAt(e.target.value)}
                  type="time"
                  value={startsAt}
                />
              </label>
              <label>
                Hasta
                <input
                  onChange={(e) => setEndsAt(e.target.value)}
                  type="time"
                  value={endsAt}
                />
              </label>
            </div>
          </div>
        )}

        <div className="admin-modal-actions">
          <button className="secondary-link" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="primary-link" disabled={isPending} type="submit">
            {isPending ? "Creando carta..." : "Crear carta"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export function EditMenuDialog({
  menu,
  isOpen,
  onClose,
}: {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("menu_id", menu.id);

    startTransition(async () => {
      await updateMenu(formData);
      onClose();
    });
  }

  return (
    <AdminDialog onClose={onClose}>
      <form className="admin-modal-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Editar carta</p>
          <h2>{menu.name}</h2>
          <p>Modificá los datos generales de la carta.</p>
        </div>

        <label>
          Nombre de la carta
          <input
            autoFocus
            defaultValue={menu.name}
            name="name"
            placeholder="Ej: Menú Ejecutivo"
            required
            type="text"
          />
        </label>

        <label>
          Descripción <span className="field-optional">Opcional</span>
          <textarea
            defaultValue={menu.description || ""}
            name="description"
            placeholder="Breve reseña sobre esta carta..."
            rows={2}
          />
        </label>

        <label className="checkbox-label">
          <input defaultChecked={menu.is_active} name="is_active" type="checkbox" />
          Carta activa (visible para los comensales en sus horarios)
        </label>

        <div className="admin-modal-actions">
          <button className="secondary-link" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="primary-link" disabled={isPending} type="submit">
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export function MenuSchedulesDialog({
  menu,
  schedules,
  isOpen,
  onClose,
}: {
  menu: Menu;
  schedules: MenuSchedule[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [scheduleList, setScheduleList] = useState<
    Array<{ id?: string; day_of_week: number | null; starts_at: string; ends_at: string }>
  >(
    schedules.length > 0
      ? schedules.map((s) => ({
          id: s.id,
          day_of_week: s.day_of_week,
          starts_at: s.starts_at.slice(0, 5),
          ends_at: s.ends_at.slice(0, 5),
        }))
      : [{ day_of_week: null, starts_at: "12:00", ends_at: "23:30" }]
  );

  if (!isOpen) return null;

  function addScheduleRow() {
    setScheduleList((prev) => [
      ...prev,
      { day_of_week: null, starts_at: "12:00", ends_at: "16:00" },
    ]);
  }

  function removeScheduleRow(index: number) {
    setScheduleList((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(
    index: number,
    field: "day_of_week" | "starts_at" | "ends_at",
    value: string | number | null
  ) {
    setScheduleList((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("menu_id", menu.id);
    formData.set("schedules_json", JSON.stringify(scheduleList));

    startTransition(async () => {
      await saveMenuSchedules(formData);
      onClose();
    });
  }

  return (
    <AdminDialog onClose={onClose}>
      <form className="admin-modal-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Horarios de disponibilidad</p>
          <h2>{menu.name}</h2>
          <p>
            Configurá los días y franjas horarias en las que esta carta estará disponible para los
            comensales.
          </p>
        </div>

        <div className="admin-schedules-list">
          {scheduleList.map((row, index) => (
            <div key={index} className="admin-schedule-row-card">
              <div className="admin-schedule-row-inputs">
                <label>
                  Días
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      updateRow(index, "day_of_week", val === "null" ? null : Number(val));
                    }}
                    value={row.day_of_week === null ? "null" : String(row.day_of_week)}
                  >
                    <option value="null">Todos los días</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                  </select>
                </label>

                <div className="admin-form-row">
                  <label>
                    Desde
                    <input
                      onChange={(e) => updateRow(index, "starts_at", e.target.value)}
                      required
                      type="time"
                      value={row.starts_at}
                    />
                  </label>
                  <label>
                    Hasta
                    <input
                      onChange={(e) => updateRow(index, "ends_at", e.target.value)}
                      required
                      type="time"
                      value={row.ends_at}
                    />
                  </label>
                </div>
              </div>

              {scheduleList.length > 1 && (
                <button
                  className="admin-schedule-remove-btn"
                  onClick={() => removeScheduleRow(index)}
                  title="Quitar franja horaria"
                  type="button"
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          className="secondary-link admin-add-schedule-btn"
          onClick={addScheduleRow}
          type="button"
        >
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
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Agregar otra franja horaria
        </button>

        <div className="admin-modal-actions">
          <button className="secondary-link" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="primary-link" disabled={isPending} type="submit">
            {isPending ? "Guardando..." : "Guardar horarios"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export function MenuBannerDialog({
  menu,
  isOpen,
  onClose,
}: {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setBannerPreview(URL.createObjectURL(file));
    else setBannerPreview(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("menu_id", menu.id);

    startTransition(async () => {
      await updateMenuBanner(formData);
      setBannerPreview(null);
      onClose();
    });
  }

  return (
    <AdminDialog
      onClose={() => {
        setBannerPreview(null);
        onClose();
      }}
    >
      <form className="admin-modal-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Foto de portada</p>
          <h2>{menu.name}</h2>
          <p>Cargar una imagen de cabecera específica para esta carta.</p>
        </div>

        <label>
          Seleccionar nueva imagen de cabecera <span className="field-optional">JPG, PNG o WebP; máx 5 MB</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            name="banner_image"
            onChange={handleFileChange}
            required
            type="file"
          />
        </label>

        {bannerPreview && (
          <div className="admin-image-preview-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Previsualización" className="admin-banner-preview-img" src={bannerPreview} />
          </div>
        )}

        <div className="admin-modal-actions">
          <button className="secondary-link" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="primary-link" disabled={isPending} type="submit">
            {isPending ? "Subiendo banner..." : "Guardar banner"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

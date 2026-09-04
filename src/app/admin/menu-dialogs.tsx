"use client";

import { useEffect, useId, useState, useTransition } from "react";
import Image from "next/image";
import { AdminDialog } from "./admin-dialog";
import {
  createMenu,
  saveMenuSchedules,
  updateMenu,
  updateMenuBanner,
} from "./actions";
import { menuImageUrl } from "@/lib/restaurant-branding";
import type { Menu, MenuSchedule } from "./types";

export const WEEK_DAYS = [
  { day: 1, label: "Lun", full: "Lunes" },
  { day: 2, label: "Mar", full: "Martes" },
  { day: 3, label: "Mié", full: "Miércoles" },
  { day: 4, label: "Jue", full: "Jueves" },
  { day: 5, label: "Vie", full: "Viernes" },
  { day: 6, label: "Sáb", full: "Sábado" },
  { day: 0, label: "Dom", full: "Domingo" },
];

export type ScheduleInterval = {
  id: string;
  days: number[];
  starts_at: string;
  ends_at: string;
};

type MenuFormDialogProps = {
  isOpen: boolean;
  menu?: Menu | null;
  schedules?: MenuSchedule[];
  onClose: () => void;
  onCreated?: (newMenuId: string) => void;
};

export function MenuFormDialog({
  isOpen,
  menu,
  schedules = [],
  onClose,
  onCreated,
}: MenuFormDialogProps) {
  const isEditing = Boolean(menu);
  const [isPending, startTransition] = useTransition();

  // Banner State
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Schedules State
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState(() => {
    if (!isEditing) return true;
    if (schedules.length === 0) return true;
    if (
      schedules.length === 1 &&
      schedules[0].day_of_week === null &&
      schedules[0].starts_at.slice(0, 5) === "00:00" &&
      schedules[0].ends_at.slice(0, 5) >= "23:59"
    ) {
      return true;
    }
    return false;
  });

  const [intervals, setIntervals] = useState<ScheduleInterval[]>(() => {
    if (schedules.length > 0) {
      // Group schedules with matching times
      const groups = new Map<string, number[]>();
      for (const s of schedules) {
        const key = `${s.starts_at.slice(0, 5)}_${s.ends_at.slice(0, 5)}`;
        const day = s.day_of_week === null ? -1 : s.day_of_week;
        const currentDays = groups.get(key) ?? [];
        if (day === -1) {
          groups.set(key, [1, 2, 3, 4, 5, 6, 0]);
        } else {
          groups.set(key, [...currentDays, day]);
        }
      }

      const list: ScheduleInterval[] = [];
      let counter = 0;
      for (const [key, days] of groups.entries()) {
        const [starts, ends] = key.split("_");
        list.push({
          id: `int-${counter++}`,
          days: Array.from(new Set(days)),
          starts_at: starts,
          ends_at: ends,
        });
      }
      return list.length > 0
        ? list
        : [
            {
              id: "int-default",
              days: [1, 2, 3, 4, 5, 6, 0],
              starts_at: "12:00",
              ends_at: "23:30",
            },
          ];
    }
    return [
      {
        id: "int-init",
        days: [1, 2, 3, 4, 5, 6, 0],
        starts_at: "12:00",
        ends_at: "23:30",
      },
    ];
  });

  if (!isOpen) return null;

  const currentBannerPath = menu?.banner_path ?? null;

  function handleBannerChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setRemoveBanner(false);
    }
  }

  function handleRemoveBanner() {
    setSelectedFile(null);
    setBannerPreview(null);
    setRemoveBanner(true);
  }

  function toggleDayInInterval(intervalId: string, day: number) {
    setIntervals((prev) =>
      prev.map((item) => {
        if (item.id !== intervalId) return item;
        const hasDay = item.days.includes(day);
        const nextDays = hasDay
          ? item.days.filter((d) => d !== day)
          : [...item.days, day];
        return { ...item, days: nextDays };
      })
    );
  }

  function setDaysPreset(intervalId: string, preset: "all" | "weekdays" | "weekends") {
    let days: number[] = [];
    if (preset === "all") days = [1, 2, 3, 4, 5, 6, 0];
    else if (preset === "weekdays") days = [1, 2, 3, 4, 5];
    else if (preset === "weekends") days = [6, 0];

    setIntervals((prev) =>
      prev.map((item) => (item.id === intervalId ? { ...item, days } : item))
    );
  }

  function updateIntervalTime(
    intervalId: string,
    field: "starts_at" | "ends_at",
    value: string
  ) {
    setIntervals((prev) =>
      prev.map((item) =>
        item.id === intervalId ? { ...item, [field]: value } : item
      )
    );
  }

  function addInterval() {
    setIntervals((prev) => [
      ...prev,
      {
        id: `int-${Date.now()}`,
        days: [1, 2, 3, 4, 5],
        starts_at: "20:00",
        ends_at: "00:00",
      },
    ]);
  }

  function removeInterval(intervalId: string) {
    if (intervals.length <= 1) return;
    setIntervals((prev) => prev.filter((item) => item.id !== intervalId));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (isEditing && menu) {
      formData.set("menu_id", menu.id);
      if (removeBanner) {
        formData.set("remove_banner", "true");
      }
    }

    if (selectedFile) {
      formData.set("banner_image", selectedFile);
    }

    // Schedules serialization
    if (isAlwaysAvailable) {
      formData.set(
        "schedules_json",
        JSON.stringify([
          { days: [1, 2, 3, 4, 5, 6, 0], starts_at: "00:00", ends_at: "23:59" },
        ])
      );
    } else {
      const cleanIntervals = intervals.filter((item) => item.days.length > 0);
      formData.set("schedules_json", JSON.stringify(cleanIntervals));
    }

    startTransition(async () => {
      if (isEditing) {
        await updateMenu(formData);
        onClose();
      } else {
        const res = await createMenu(formData);
        onClose();
        if (res?.menuId && onCreated) {
          onCreated(res.menuId);
        }
      }
    });
  }

  return (
    <AdminDialog onClose={onClose} maxWidth="48rem">
      <form className="admin-modal-form" onSubmit={handleSubmit}>
        {/* 1- FOTO (Banner de la carta) */}
        <div className="modal-hero-photo-section">
          <div className="modal-banner-display">
            {bannerPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Vista previa portada"
                className="modal-banner-img"
                src={bannerPreview}
              />
            ) : !removeBanner && currentBannerPath ? (
              <Image
                alt={menu?.name || "Portada de carta"}
                className="modal-banner-img"
                fill
                priority
                sizes="700px"
                src={menuImageUrl(currentBannerPath)}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="modal-banner-placeholder">
                <svg
                  fill="none"
                  height="36"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="36"
                >
                  <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Sin foto de portada</span>
              </div>
            )}

            <div className="modal-banner-actions-overlay">
              <label className="modal-banner-upload-btn">
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                {bannerPreview || (!removeBanner && currentBannerPath)
                  ? "Cambiar foto"
                  : "Subir foto de portada"}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="visually-hidden"
                  onChange={handleBannerChange}
                  type="file"
                />
              </label>

              {(bannerPreview || (!removeBanner && currentBannerPath)) && (
                <button
                  className="modal-banner-remove-btn"
                  onClick={handleRemoveBanner}
                  title="Quitar foto de portada"
                  type="button"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2- TÍTULO y 3- DESCRIPCIÓN */}
        <div className="modal-header-section">
          <p className="eyebrow">{isEditing ? "Editar carta" : "Nueva carta"}</p>
          <h2 className="modal-title">
            {isEditing ? menu?.name : "Crear nueva carta"}
          </h2>
          <p className="modal-description">
            {isEditing
              ? "Modificá los datos generales, imagen de portada y horarios de disponibilidad."
              : "Creá una carta con su propia portada, nombre, horarios y categorías de platos."}
          </p>
        </div>

        {/* CAMPOS PRINCIPALES */}
        <div className="modal-fields-group">
          <label>
            Nombre de la carta
            <input
              autoFocus
              defaultValue={menu?.name || ""}
              name="name"
              placeholder="Ej: Menú Ejecutivo, Carta de Vinos, Desayunos..."
              required
              type="text"
            />
          </label>

          <label>
            Descripción <span className="field-optional">Opcional</span>
            <textarea
              defaultValue={menu?.description || ""}
              name="description"
              placeholder="Breve reseña o aclaración sobre esta carta..."
              rows={2}
            />
          </label>

          <label className="checkbox-label" style={{ marginTop: "0.25rem" }}>
            <input
              defaultChecked={menu ? menu.is_active : true}
              name="is_active"
              type="checkbox"
            />
            <span>
              <strong>Carta activa</strong> (visible para los comensales dentro de sus horarios)
            </span>
          </label>
        </div>

        {/* FRANJAS HORARIAS Y DÍAS */}
        <div className="modal-schedule-section">
          <div className="schedule-section-header">
            <div>
              <h3>Horarios y disponibilidad</h3>
              <p>Definí qué días y horas está disponible esta carta para los clientes.</p>
            </div>

            <div className="schedule-availability-mode">
              <button
                className={`availability-pill ${isAlwaysAvailable ? "is-active" : ""}`}
                onClick={() => setIsAlwaysAvailable(true)}
                type="button"
              >
                Siempre activa (24 hs)
              </button>
              <button
                className={`availability-pill ${!isAlwaysAvailable ? "is-active" : ""}`}
                onClick={() => setIsAlwaysAvailable(false)}
                type="button"
              >
                Horario programado
              </button>
            </div>
          </div>

          {!isAlwaysAvailable && (
            <div className="schedule-intervals-list">
              {intervals.map((interval, index) => (
                <div className="schedule-interval-card" key={interval.id}>
                  <div className="schedule-interval-top">
                    <span className="interval-index-badge">
                      Franja {index + 1}
                    </span>

                    <div className="interval-presets">
                      <button
                        className="preset-btn"
                        onClick={() => setDaysPreset(interval.id, "all")}
                        type="button"
                      >
                        Todos
                      </button>
                      <button
                        className="preset-btn"
                        onClick={() => setDaysPreset(interval.id, "weekdays")}
                        type="button"
                      >
                        Lun a Vie
                      </button>
                      <button
                        className="preset-btn"
                        onClick={() => setDaysPreset(interval.id, "weekends")}
                        type="button"
                      >
                        Sáb y Dom
                      </button>
                    </div>

                    {intervals.length > 1 && (
                      <button
                        aria-label="Eliminar franja horaria"
                        className="interval-delete-btn"
                        onClick={() => removeInterval(interval.id)}
                        type="button"
                      >
                        <svg
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

                  {/* DÍAS DE LA SEMANA - CHECKBOXES */}
                  <div className="schedule-days-selector">
                    <p className="days-label">Días de aplicación:</p>
                    <div className="days-checkbox-grid">
                      {WEEK_DAYS.map((d) => {
                        const isChecked = interval.days.includes(d.day);
                        return (
                          <button
                            aria-pressed={isChecked}
                            className={`day-toggle-btn ${isChecked ? "is-selected" : ""}`}
                            key={d.day}
                            onClick={() => toggleDayInInterval(interval.id, d.day)}
                            title={d.full}
                            type="button"
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* HORARIO DESDE / HASTA */}
                  <div className="schedule-time-range-row">
                    <label className="time-field">
                      <span>Desde</span>
                      <input
                        onChange={(e) =>
                          updateIntervalTime(interval.id, "starts_at", e.target.value)
                        }
                        required
                        type="time"
                        value={interval.starts_at}
                      />
                    </label>

                    <span className="time-separator">—</span>

                    <label className="time-field">
                      <span>Hasta</span>
                      <input
                        onChange={(e) =>
                          updateIntervalTime(interval.id, "ends_at", e.target.value)
                        }
                        required
                        type="time"
                        value={interval.ends_at}
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                className="add-interval-btn"
                onClick={addInterval}
                type="button"
              >
                <svg
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
                Agregar otra franja horaria
              </button>
            </div>
          )}
        </div>

        {/* ACCIONES */}
        <div className="admin-modal-actions">
          <button className="secondary-link" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="primary-link" disabled={isPending} type="submit">
            {isPending
              ? "Guardando..."
              : isEditing
              ? "Guardar cambios"
              : "Crear carta"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

// Backward-compatible export for CreateMenuDialog
export function CreateMenuDialog({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newMenuId: string) => void;
}) {
  return (
    <MenuFormDialog
      isOpen={isOpen}
      menu={null}
      onClose={onClose}
      onCreated={onCreated}
    />
  );
}

// Backward-compatible export for EditMenuDialog
export function EditMenuDialog({
  menu,
  isOpen,
  onClose,
}: {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <MenuFormDialog
      isOpen={isOpen}
      menu={menu}
      onClose={onClose}
      schedules={menu.schedules || []}
    />
  );
}

// Backward-compatible export for MenuSchedulesDialog
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
  return (
    <MenuFormDialog
      isOpen={isOpen}
      menu={menu}
      onClose={onClose}
      schedules={schedules}
    />
  );
}

// Backward-compatible export for MenuBannerDialog
export function MenuBannerDialog({
  menu,
  isOpen,
  onClose,
}: {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <MenuFormDialog
      isOpen={isOpen}
      menu={menu}
      onClose={onClose}
      schedules={menu.schedules || []}
    />
  );
}

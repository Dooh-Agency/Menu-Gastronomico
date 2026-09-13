"use client";

import { useState } from "react";
import { updateRestaurantConfiguration, updateRestaurantSettings } from "../actions";
import {
  RestaurantBranding,
  RestaurantContact,
  restaurantFonts,
  RestaurantFont,
  menuImageUrl,
} from "@/lib/restaurant-branding";
import { DishCardCompact } from "@/components/dish-cards";
import type { MenuItem } from "@/components/dish-cards/types";

interface SettingsViewProps {
  restaurant: {
    name: string;
    timezone: string;
    supported_locales: string[];
    default_locale: string;
    branding: RestaurantBranding;
  };
  settings: {
    unavailable_item_behavior: "hide" | "show_sold_out";
    contact: RestaurantContact;
  };
}

// Sample dish item for authentic real card preview
const sampleDishItem: MenuItem = {
  id: "preview-sample-1",
  category_id: "preview-cat-1",
  name: "Bife de Chorizo a las Brasas",
  description: "350g de bife de chorizo madurado con papas rústicas, chimichurri artesanal y manteca de hierbas.",
  price_cents: 14500,
  currency_code: "ARS",
  image_path: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  image_paths: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80",
  ],
  dietary_tags: ["Sin TACC", "Casero"],
  allergens: [],
  is_available: true,
  sort_order: 1,
  translations: [],
};

export function SettingsView({ restaurant, settings }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"general" | "design" | "advanced">("general");

  // Dynamic state for design live preview
  const [brandingState, setBrandingState] = useState<RestaurantBranding>({
    primary_color: restaurant.branding.primary_color || "#ae4c2c",
    secondary_color: restaurant.branding.secondary_color || "#f3e5df",
    surface_color: restaurant.branding.surface_color || "#fffdf8",
    text_color: restaurant.branding.text_color || "#1f2937",
    accent_text_color: restaurant.branding.accent_text_color || "#ae4c2c",
    font_family: restaurant.branding.font_family || "inter",
    radius: restaurant.branding.radius || "rounded",
    established_year: restaurant.branding.established_year || "",
  });

  const logoUrl = menuImageUrl(restaurant.branding.logo_path);
  const coverUrl = menuImageUrl(restaurant.branding.cover_image_path);

  const handleColorChange = (key: keyof RestaurantBranding, value: string) => {
    setBrandingState((prev) => ({ ...prev, [key]: value }));
  };

  const getRadiusPx = (r?: string) => {
    if (r === "square") return "0px";
    if (r === "soft") return "6px";
    return "16px";
  };

  return (
    <div className="settings-container">
      {/* Sub-navigation Tabs */}
      <div className="settings-tabs" role="tablist" aria-label="Secciones de configuración">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "general"}
          className={`settings-tab-btn ${activeTab === "general" ? "is-active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Información general</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "design"}
          className={`settings-tab-btn ${activeTab === "design" ? "is-active" : ""}`}
          onClick={() => setActiveTab("design")}
        >
          <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.38-.42-.6-.99-.6-1.58 0-1.24 1.01-2.25 2.25-2.25H18c2.21 0 4-1.79 4-4 0-5.51-4.49-10-10-10z" />
          </svg>
          <span>Diseño</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "advanced"}
          className={`settings-tab-btn ${activeTab === "advanced" ? "is-active" : ""}`}
          onClick={() => setActiveTab("advanced")}
        >
          <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>Ajustes avanzados</span>
        </button>
      </div>

      {/* TAB 1: INFORMACIÓN GENERAL */}
      {activeTab === "general" && (
        <section className="settings-card-section animate-fade-in">
          <div className="section-header">
            <h2>Información general</h2>
            <p className="admin-intro">
              Administrá los datos públicos principales del restaurante, su logo y banner de portada.
            </p>
          </div>

          <form action={updateRestaurantConfiguration} className="settings-form">
            <div className="settings-grid">
              <label>
                Nombre público
                <input
                  defaultValue={restaurant.name}
                  maxLength={120}
                  name="name"
                  placeholder="Nombre de tu restaurante"
                  required
                />
              </label>

              <label>
                Fecha / Año de fundación
                <span className="field-optional">Ej: 2018 o 15/05/2018</span>
                <input
                  defaultValue={brandingState.established_year || ""}
                  maxLength={30}
                  name="established_year"
                  placeholder="Ej: 2018"
                />
              </label>
            </div>

            <div className="brand-uploaders-grid">
              {/* Logo Uploader Card */}
              <div className="uploader-card">
                <div className="uploader-card-header">
                  <h3>Logo del restaurante</h3>
                  <span className="field-optional">JPG, PNG o WebP · hasta 5 MB</span>
                </div>
                <div className="uploader-preview-container">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo actual" className="logo-preview-img" />
                  ) : (
                    <div className="fallback-logo-box">
                      <span>Sin logo</span>
                    </div>
                  )}
                  <label className="uploader-file-btn">
                    <span>{logoUrl ? "Cambiar logo" : "Subir logo"}</span>
                    <input accept="image/jpeg,image/png,image/webp" name="logo" type="file" />
                  </label>
                </div>
              </div>

              {/* Banner / Cover Uploader Card */}
              <div className="uploader-card">
                <div className="uploader-card-header">
                  <h3>Banner / Imagen de portada</h3>
                  <span className="field-optional">JPG, PNG o WebP · hasta 5 MB</span>
                </div>
                <div className="uploader-preview-container cover-container">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Portada actual" className="cover-preview-img" />
                  ) : (
                    <div className="fallback-cover-box">
                      <span>Sin portada</span>
                    </div>
                  )}
                  <label className="uploader-file-btn">
                    <span>{coverUrl ? "Cambiar portada" : "Subir portada"}</span>
                    <input accept="image/jpeg,image/png,image/webp" name="cover_image" type="file" />
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-action-bar">
              <button className="primary-link" type="submit">
                Guardar información general
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 2: DISEÑO */}
      {activeTab === "design" && (
        <section className="settings-card-section animate-fade-in">
          <div className="section-header">
            <h2>Diseño e identidad visual</h2>
            <p className="admin-intro">
              Personalizá la paleta de colores, tipografía y estilo de bordes para el menú público.
            </p>
          </div>

          <form action={updateRestaurantConfiguration} className="settings-form">
            <div className="design-layout-grid">
              {/* Form Controls Left */}
              <div className="design-controls">
                <div className="color-pickers-grid">
                  <label className="color-label">
                    <span>Color principal</span>
                    <div className="color-input-wrapper">
                      <input
                        value={brandingState.primary_color}
                        name="primary_color"
                        pattern="#[0-9A-Fa-f]{6}"
                        required
                        type="color"
                        onChange={(e) => handleColorChange("primary_color", e.target.value)}
                      />
                      <code>{brandingState.primary_color}</code>
                    </div>
                  </label>

                  <label className="color-label">
                    <span>Color secundario</span>
                    <div className="color-input-wrapper">
                      <input
                        value={brandingState.secondary_color}
                        name="secondary_color"
                        pattern="#[0-9A-Fa-f]{6}"
                        required
                        type="color"
                        onChange={(e) => handleColorChange("secondary_color", e.target.value)}
                      />
                      <code>{brandingState.secondary_color}</code>
                    </div>
                  </label>

                  <label className="color-label">
                    <span>Fondo</span>
                    <div className="color-input-wrapper">
                      <input
                        value={brandingState.surface_color}
                        name="surface_color"
                        pattern="#[0-9A-Fa-f]{6}"
                        required
                        type="color"
                        onChange={(e) => handleColorChange("surface_color", e.target.value)}
                      />
                      <code>{brandingState.surface_color}</code>
                    </div>
                  </label>

                  <label className="color-label">
                    <span>Color de texto</span>
                    <div className="color-input-wrapper">
                      <input
                        value={brandingState.text_color}
                        name="text_color"
                        pattern="#[0-9A-Fa-f]{6}"
                        required
                        type="color"
                        onChange={(e) => handleColorChange("text_color", e.target.value)}
                      />
                      <code>{brandingState.text_color}</code>
                    </div>
                  </label>

                  <label className="color-label">
                    <span>Texto de acento</span>
                    <div className="color-input-wrapper">
                      <input
                        value={brandingState.accent_text_color}
                        name="accent_text_color"
                        pattern="#[0-9A-Fa-f]{6}"
                        required
                        type="color"
                        onChange={(e) => handleColorChange("accent_text_color", e.target.value)}
                      />
                      <code>{brandingState.accent_text_color}</code>
                    </div>
                  </label>
                </div>

                <div className="settings-grid margin-top-1rem">
                  <label>
                    Tipografía
                    <select
                      value={brandingState.font_family}
                      name="font_family"
                      onChange={(e) => handleColorChange("font_family", e.target.value as RestaurantFont)}
                    >
                      {Object.entries(restaurantFonts).map(([value, font]) => (
                        <option key={value} value={value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Estilo de bordes
                    <select
                      value={brandingState.radius}
                      name="radius"
                      onChange={(e) =>
                        handleColorChange("radius", e.target.value as "soft" | "rounded" | "square")
                      }
                    >
                      <option value="soft">Suave (Bordes ligeros)</option>
                      <option value="rounded">Redondeado (Moderno)</option>
                      <option value="square">Recto (Minimalista)</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* REAL COMPACT DISH CARD LIVE PREVIEW */}
              <div className="theme-preview-wrapper">
                <div className="preview-header-bar">
                  <span className="preview-heading-tag">Vista previa en vivo</span>
                </div>

                {/* Real Compact Dish Card Frame with Injected CSS Variables */}
                <div
                  className="preview-card-frame"
                  style={{
                    ["--color-accent" as string]: brandingState.primary_color,
                    ["--color-secondary" as string]: brandingState.secondary_color,
                    ["--color-surface" as string]: brandingState.surface_color,
                    ["--color-ink" as string]: brandingState.text_color,
                    ["--color-text" as string]: brandingState.text_color,
                    ["--color-accent-text" as string]: brandingState.accent_text_color,
                    ["--radius-card" as string]: getRadiusPx(brandingState.radius),
                    fontFamily: restaurantFonts[brandingState.font_family || "inter"]?.cssFamily,
                    backgroundColor: brandingState.surface_color,
                    color: brandingState.text_color,
                  }}
                >
                  <div className="preview-menu-section-header" style={{ color: brandingState.primary_color }}>
                    <span>Categoría: Carnes a la Parrilla</span>
                  </div>

                  <div className="preview-carousel-wrapper">
                    <DishCardCompact item={sampleDishItem} locale="es" />
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-action-bar">
              <button className="primary-link" type="submit">
                Guardar diseño visual
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: AJUSTES AVANZADOS */}
      {activeTab === "advanced" && (
        <section className="settings-card-section animate-fade-in">
          <div className="section-header">
            <h2>Ajustes avanzados y operación</h2>
            <p className="admin-intro">
              Configuraciones de idiomas, zona horaria, comportamiento de stock y datos de contacto.
            </p>
          </div>

          <form action={updateRestaurantConfiguration} className="settings-form">
            <fieldset className="settings-fieldset">
              <legend>Idiomas del restaurante</legend>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    defaultChecked={restaurant.supported_locales.includes("es")}
                    name="supported_locales"
                    type="checkbox"
                    value="es"
                  />
                  <span>Español (ES)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    defaultChecked={restaurant.supported_locales.includes("en")}
                    name="supported_locales"
                    type="checkbox"
                    value="en"
                  />
                  <span>Inglés (EN)</span>
                </label>
              </div>

              <div className="settings-grid margin-top-1rem">
                <label>
                  Idioma predeterminado
                  <select defaultValue={restaurant.default_locale} name="default_locale">
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                  </select>
                </label>

                <label>
                  Zona horaria del local
                  <input
                    defaultValue={restaurant.timezone}
                    name="timezone"
                    placeholder="America/Argentina/Buenos_Aires"
                    required
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="settings-fieldset">
              <legend>Datos de contacto del local</legend>
              <div className="settings-grid">
                <label>
                  Teléfono de contacto
                  <input defaultValue={settings.contact.phone || ""} name="phone" type="tel" placeholder="+54 11 1234-5678" />
                </label>
                <label>
                  Email de contacto
                  <input defaultValue={settings.contact.email || ""} name="email" type="email" placeholder="contacto@restaurante.com" />
                </label>
                <label>
                  Dirección del local
                  <input defaultValue={settings.contact.address || ""} name="address" placeholder="Av. Corrientes 1234, CABA" />
                </label>
                <label>
                  Sitio web oficial
                  <input
                    defaultValue={settings.contact.website || ""}
                    name="website"
                    placeholder="https://restaurante.com"
                    type="url"
                  />
                </label>
              </div>
            </fieldset>

            <div className="settings-action-bar">
              <button className="primary-link" type="submit">
                Guardar ajustes avanzados
              </button>
            </div>
          </form>

          {/* Separate Form for Sold Out Behavior */}
          <div className="settings-divider" />

          <form action={updateRestaurantSettings} className="settings-form">
            <fieldset className="settings-fieldset">
              <legend>Comportamiento de productos no disponibles</legend>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    defaultChecked={settings.unavailable_item_behavior === "show_sold_out"}
                    name="unavailable_item_behavior"
                    type="radio"
                    value="show_sold_out"
                  />
                  <div>
                    <strong>Mostrar como agotados</strong>
                    <p className="admin-intro">El plato se muestra grisado con el badge &quot;Agotado&quot;.</p>
                  </div>
                </label>

                <label className="radio-label">
                  <input
                    defaultChecked={settings.unavailable_item_behavior === "hide"}
                    name="unavailable_item_behavior"
                    type="radio"
                    value="hide"
                  />
                  <div>
                    <strong>Ocultar del menú público</strong>
                    <p className="admin-intro">El plato no aparecerá en el menú hasta volver a estar disponible.</p>
                  </div>
                </label>
              </div>
            </fieldset>

            <div className="settings-action-bar">
              <button className="primary-link" type="submit">
                Guardar disponibilidad
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

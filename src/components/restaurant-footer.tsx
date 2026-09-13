import React from "react";
import type { RestaurantContact } from "@/lib/restaurant-branding";
import { formatPhoneNumber, getTelHref } from "@/lib/phone-formatter";

interface RestaurantFooterProps {
  restaurantName: string;
  contact: RestaurantContact;
  className?: string;
}

export function RestaurantFooter({ restaurantName, contact, className = "" }: RestaurantFooterProps) {
  const { phone, email, address, website } = contact;

  const hasContactInfo = Boolean(phone || email || address || website);

  if (!hasContactInfo) return null;

  const formattedPhone = formatPhoneNumber(phone);
  const telHref = getTelHref(phone);

  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${restaurantName}`)}`
    : null;

  return (
    <footer className={`restaurant-footer ${className}`} aria-label="Información de contacto">
      <div className="restaurant-footer-container">
        <div className="restaurant-footer-header">
          <h2 className="restaurant-footer-title">{restaurantName}</h2>
          <span className="restaurant-footer-subtitle">Contacto & Ubicación</span>
        </div>

        <div className="restaurant-footer-grid">
          {/* Teléfono */}
          {phone ? (
            <a
              href={telHref}
              className="restaurant-footer-card"
              aria-label={`Llamar a ${restaurantName}: ${formattedPhone}`}
            >
              <div className="restaurant-footer-icon-badge" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="restaurant-footer-card-content">
                <span className="restaurant-footer-label">Teléfono</span>
                <span className="restaurant-footer-value">{formattedPhone}</span>
              </div>
            </a>
          ) : null}

          {/* Email */}
          {email ? (
            <a
              href={`mailto:${email}`}
              className="restaurant-footer-card"
              aria-label={`Enviar correo a ${email}`}
            >
              <div className="restaurant-footer-icon-badge" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="restaurant-footer-card-content">
                <span className="restaurant-footer-label">Email</span>
                <span className="restaurant-footer-value">{email}</span>
              </div>
            </a>
          ) : null}

          {/* Ubicación */}
          {address ? (
            <a
              href={mapsUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="restaurant-footer-card"
              aria-label={`Ubicación: ${address}`}
            >
              <div className="restaurant-footer-icon-badge" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="restaurant-footer-card-content">
                <span className="restaurant-footer-label">Dirección</span>
                <span className="restaurant-footer-value">{address}</span>
              </div>
            </a>
          ) : null}

          {/* Sitio Web */}
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="restaurant-footer-card"
              aria-label={`Visitar sitio web: ${website}`}
            >
              <div className="restaurant-footer-icon-badge" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div className="restaurant-footer-card-content">
                <span className="restaurant-footer-label">Sitio Web</span>
                <span className="restaurant-footer-value">
                  {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </div>
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

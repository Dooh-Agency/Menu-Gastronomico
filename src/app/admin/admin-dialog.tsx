"use client";

import { type ReactNode, useEffect, useRef } from "react";

type AdminDialogProps = {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  maxWidth?: string;
};

export function AdminDialog({
  children,
  onClose,
  className,
  maxWidth,
}: AdminDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("[autofocus]")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="admin-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-modal="true"
        className={`admin-dialog ${className || ""}`.trim()}
        ref={dialogRef}
        role="dialog"
        style={maxWidth ? { maxWidth } : undefined}
      >
        <button
          aria-label="Cerrar modal"
          className="admin-dialog-close-btn"
          onClick={onClose}
          type="button"
        >
          <svg
            fill="none"
            height="20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="20"
          >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>
        {children}
      </section>
    </div>
  );
}

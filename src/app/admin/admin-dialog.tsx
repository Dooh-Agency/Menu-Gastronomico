"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function AdminDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("[autofocus]")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="admin-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="presentation"><section aria-modal="true" className="admin-dialog" ref={dialogRef} role="dialog">{children}</section></div>;
}

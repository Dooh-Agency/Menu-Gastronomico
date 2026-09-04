"use client";

import { useState } from "react";

export const DEFAULT_DIETARY_TAGS = [
  "Vegano",
  "Vegetariano",
  "Sin TACC",
  "Keto",
  "Casero",
];

export const DEFAULT_ALLERGENS = [
  "Gluten",
  "Lácteos",
  "Huevos",
  "Maní y frutos secos",
  "Pescados y mariscos",
];

type TagMultiSelectorProps = {
  label: string;
  name: string;
  options: string[];
  initialValues?: string[];
  optional?: boolean;
  helpText?: string;
};

export function TagMultiSelector({
  label,
  name,
  options,
  initialValues = [],
  optional = true,
  helpText,
}: TagMultiSelectorProps) {
  // Normalize initial values to match options (case-insensitive trimming)
  const [selected, setSelected] = useState<string[]>(() => {
    const set = new Set(initialValues.map((v) => v.trim().toLowerCase()));
    return options.filter((opt) => set.has(opt.toLowerCase()));
  });

  function toggleTag(option: string) {
    setSelected((prev) => {
      const exists = prev.some(
        (item) => item.toLowerCase() === option.toLowerCase()
      );
      if (exists) {
        return prev.filter(
          (item) => item.toLowerCase() !== option.toLowerCase()
        );
      }
      return [...prev, option];
    });
  }

  return (
    <div className="tag-multi-selector-container">
      <div className="tag-multi-selector-header">
        <label className="tag-multi-selector-label">
          {label}{" "}
          {optional ? (
            <span className="field-optional">Selección múltiple</span>
          ) : null}
        </label>
        {helpText ? (
          <p className="tag-multi-selector-help">{helpText}</p>
        ) : null}
      </div>

      {/* Hidden input ensuring compatibility with FormData textList parser */}
      <input name={name} type="hidden" value={selected.join(", ")} />

      <div
        aria-label={label}
        className="tag-multi-selector-pills"
        role="group"
      >
        {options.map((option) => {
          const isSelected = selected.some(
            (item) => item.toLowerCase() === option.toLowerCase()
          );
          return (
            <button
              aria-pressed={isSelected}
              className={`tag-pill ${isSelected ? "is-selected" : ""}`}
              key={option}
              onClick={() => toggleTag(option)}
              type="button"
            >
              <span className="tag-pill-icon">
                {isSelected ? (
                  <svg
                    fill="none"
                    height="13"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="13"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    fill="none"
                    height="13"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="13"
                  >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                )}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

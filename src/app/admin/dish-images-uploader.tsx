"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";

export interface DishImagesUploaderProps {
  initialImages?: string[];
  maxImages?: number;
  onFilesChange?: (files: File[]) => void;
  onKeptImagesChange?: (images: string[]) => void;
}

export function DishImagesUploader({
  initialImages = [],
  maxImages = 6,
  onFilesChange,
  onKeptImagesChange,
}: DishImagesUploaderProps) {
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedUrls, setStagedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop if initialImages change
  useEffect(() => {
    setExistingImages(initialImages);
  }, [initialImages]);

  // Notify parent of existing/kept images changes
  useEffect(() => {
    onKeptImagesChange?.(existingImages);
  }, [existingImages, onKeptImagesChange]);

  // Notify parent of staged files changes
  useEffect(() => {
    onFilesChange?.(stagedFiles);
  }, [stagedFiles, onFilesChange]);

  // Sync preview URLs for staged files
  useEffect(() => {
    const urls = stagedFiles.map((file) => URL.createObjectURL(file));
    setStagedUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [stagedFiles]);

  // Sync staged files with the real file input so native form submission includes all files
  useEffect(() => {
    if (!fileInputRef.current) return;
    try {
      const dt = new DataTransfer();
      stagedFiles.forEach((file) => dt.items.add(file));
      fileInputRef.current.files = dt.files;
    } catch {
      // Fallback for environments where DataTransfer constructor isn't supported
    }
  }, [stagedFiles]);

  const totalImages = existingImages.length + stagedFiles.length;
  const canAddMore = totalImages < maxImages;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    console.log("[CLIENT DishImagesUploader] Selected raw files:", files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    if (files.length === 0) return;

    const remainingSlots = maxImages - existingImages.length - stagedFiles.length;
    if (remainingSlots <= 0) return;

    const validNewFiles = files
      .filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024)
      .slice(0, remainingSlots);

    console.log("[CLIENT DishImagesUploader] Adding valid new files:", validNewFiles.length);
    setStagedFiles((prev) => [...prev, ...validNewFiles]);
    if (e.target) {
      e.target.value = "";
    }
  }

  function handleRemoveExisting(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemoveStaged(index: number) {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="dish-uploader-container">
      <div className="dish-uploader-header">
        <span className="dish-uploader-title">
          Fotos del plato{" "}
          <span className="field-optional">
            ({totalImages}/{maxImages} fotos · JPG, PNG o WebP, máx 5 MB c/u)
          </span>
        </span>
      </div>

      {/* Flag indicating the image manager is present */}
      <input name="has_image_manager" type="hidden" value="true" />

      {/* Hidden inputs to pass kept existing images to the server action */}
      {existingImages.map((path) => (
        <input key={path} name="kept_image_paths" type="hidden" value={path} />
      ))}

      {/* Actual file input holding the staged files */}
      <input
        accept="image/jpeg,image/png,image/webp"
        className="dish-uploader-hidden-input"
        multiple
        name="images"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
      />

      {/* Preview Grid */}
      {totalImages > 0 ? (
        <div className="dish-uploader-grid">
          {/* Existing images */}
          {existingImages.map((imgPath, idx) => (
            <div className="dish-uploader-thumb" key={`existing-${imgPath}-${idx}`}>
              <Image
                alt={`Foto ${idx + 1}`}
                className="dish-uploader-img"
                fill
                sizes="120px"
                src={menuImageUrl(imgPath)}
              />
              <span className={`dish-uploader-badge ${idx === 0 ? "is-primary" : ""}`}>
                {idx === 0 ? "Portada" : `#${idx + 1}`}
              </span>
              <button
                aria-label={`Eliminar foto ${idx + 1}`}
                className="dish-uploader-remove-btn"
                onClick={() => handleRemoveExisting(idx)}
                title="Eliminar esta foto"
                type="button"
              >
                ×
              </button>
            </div>
          ))}

          {/* Newly staged files */}
          {stagedUrls.map((url, idx) => {
            const overallIdx = existingImages.length + idx;
            return (
              <div className="dish-uploader-thumb is-new" key={`new-${idx}-${url}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`Nueva foto ${overallIdx + 1}`} className="dish-uploader-img" src={url} />
                <span className={`dish-uploader-badge ${overallIdx === 0 ? "is-primary" : ""}`}>
                  {overallIdx === 0 ? "Portada" : `#${overallIdx + 1}`}
                </span>
                <button
                  aria-label={`Eliminar foto ${overallIdx + 1}`}
                  className="dish-uploader-remove-btn"
                  onClick={() => handleRemoveStaged(idx)}
                  title="Eliminar esta foto"
                  type="button"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Button to add more if slots available */}
          {canAddMore && (
            <button
              className="dish-uploader-add-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="22"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
                width="22"
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>Agregar más</span>
            </button>
          )}
        </div>
      ) : (
        /* Empty Dropzone / Select button */
        <div
          className="dish-uploader-dropzone"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <div className="dish-uploader-dropzone-icon">
            <svg
              aria-hidden="true"
              fill="none"
              height="28"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="28"
            >
              <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="dish-uploader-dropzone-text">
            <strong>Subir fotos del plato</strong>
            <p>Podés seleccionar varias fotos a la vez (hasta {maxImages})</p>
          </div>
          <button
            className="secondary-link dish-uploader-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            type="button"
          >
            Explorar archivos
          </button>
        </div>
      )}
    </div>
  );
}

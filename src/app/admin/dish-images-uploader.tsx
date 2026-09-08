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

type StagedImage = {
  file: File;
  url: string;
};

const DEFAULT_EMPTY_IMAGES: string[] = [];

export function DishImagesUploader({
  initialImages = DEFAULT_EMPTY_IMAGES,
  maxImages = 6,
  onFilesChange,
  onKeptImagesChange,
}: DishImagesUploaderProps) {
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep reference to current staged images for cleanup on unmount
  const stagedImagesRef = useRef<StagedImage[]>([]);
  useEffect(() => {
    stagedImagesRef.current = stagedImages;
  }, [stagedImages]);

  // Track serialized representation of initialImages to prevent infinite loops from new array instances
  const serializedInitial = (initialImages || DEFAULT_EMPTY_IMAGES).join("|");
  const prevSerializedRef = useRef(serializedInitial);

  // Notify parent on mount with initial images (runs once)
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      onKeptImagesChange?.(initialImages || DEFAULT_EMPTY_IMAGES);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with prop only if the actual image paths change (e.g. user opens a different item)
  useEffect(() => {
    if (prevSerializedRef.current !== serializedInitial) {
      prevSerializedRef.current = serializedInitial;
      const next = initialImages || DEFAULT_EMPTY_IMAGES;
      setExistingImages(next);
      onKeptImagesChange?.(next);
    }
  }, [serializedInitial, initialImages, onKeptImagesChange]);

  // Sync staged files with the real file input so native form submission includes all files
  useEffect(() => {
    if (!fileInputRef.current) return;
    try {
      const dt = new DataTransfer();
      stagedImages.forEach((item) => dt.items.add(item.file));
      fileInputRef.current.files = dt.files;
    } catch {
      // Fallback for environments where DataTransfer constructor isn't supported
    }
  }, [stagedImages]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const totalImages = existingImages.length + stagedImages.length;
  const canAddMore = totalImages < maxImages;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - existingImages.length - stagedImages.length;
    if (remainingSlots <= 0) return;

    const validNewFiles = files
      .filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024)
      .slice(0, remainingSlots);

    if (validNewFiles.length === 0) return;

    const newItems: StagedImage[] = validNewFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setStagedImages((prev) => {
      const updated = [...prev, ...newItems];
      onFilesChange?.(updated.map((item) => item.file));
      return updated;
    });

    if (e.target) {
      e.target.value = "";
    }
  }

  function handleRemoveExisting(index: number) {
    setExistingImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onKeptImagesChange?.(updated);
      return updated;
    });
  }

  function handleRemoveStaged(index: number) {
    setStagedImages((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange?.(updated.map((item) => item.file));
      return updated;
    });
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
          {stagedImages.map(({ url }, idx) => {
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

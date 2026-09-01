"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";

export interface DishImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function DishImageCarousel({
  images,
  alt = "Plato",
  className = "",
}: DishImageCarouselProps) {
  const validImages = images.filter((img) => typeof img === "string" && img.trim() !== "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesKey = images.join("|");
  const [prevImagesKey, setPrevImagesKey] = useState(imagesKey);
  if (prevImagesKey !== imagesKey) {
    setPrevImagesKey(imagesKey);
    setCurrentIndex(0);
  }
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = validImages.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation when focusing inside carousel
  function handleKeyDown(event: React.KeyboardEvent) {
    if (total <= 1) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    }
  }

  // Touch swipe support
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // min swipe distance in px
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (total === 0) {
    return null;
  }

  if (total === 1) {
    const singleImage = validImages[0];
    return (
      <div className={`dish-carousel single-image ${className}`}>
        <Image
          alt={alt}
          className="dish-carousel-img"
          fill
          priority
          sizes="(max-width: 44rem) 100vw, 600px"
          src={menuImageUrl(singleImage)}
        />
      </div>
    );
  }

  return (
    <div
      aria-label="Galería de fotos del plato"
      aria-roledescription="carousel"
      className={`dish-carousel ${className}`}
      onKeyDown={handleKeyDown}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={containerRef}
      role="region"
      tabIndex={0}
    >
      {/* Pistas de imágenes deslizables */}
      <div
        className="dish-carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {validImages.map((imgPath, idx) => (
          <div
            aria-hidden={idx !== currentIndex}
            aria-label={`Foto ${idx + 1} de ${total}`}
            aria-roledescription="slide"
            className="dish-carousel-slide"
            key={`${imgPath}-${idx}`}
            role="group"
          >
            <Image
              alt={`${alt} - Foto ${idx + 1}`}
              className="dish-carousel-img"
              fill
              priority={idx === 0}
              sizes="(max-width: 44rem) 100vw, 600px"
              src={menuImageUrl(imgPath)}
            />
          </div>
        ))}
      </div>

      {/* Botón Anterior */}
      <button
        aria-label="Foto anterior"
        className="dish-carousel-nav-btn is-prev"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="18"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Botón Siguiente */}
      <button
        aria-label="Foto siguiente"
        className="dish-carousel-nav-btn is-next"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="18"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Badge Contador de fotos */}
      <div className="dish-carousel-counter" aria-hidden="true">
        {currentIndex + 1} / {total}
      </div>

      {/* Indicadores de Puntos (Dots) */}
      <div className="dish-carousel-dots" role="tablist">
        {validImages.map((_, idx) => (
          <button
            aria-label={`Ir a foto ${idx + 1}`}
            aria-selected={idx === currentIndex}
            className={`dish-carousel-dot ${idx === currentIndex ? "is-active" : ""}`}
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(idx);
            }}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

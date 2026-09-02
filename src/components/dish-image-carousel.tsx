"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const total = validImages.length;
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const imagesKey = images.join("|");
  useEffect(() => {
    setCurrentIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollLeft = 0;
    }
  }, [imagesKey]);

  // Sync scroll position when user swipes or scrolls manually
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (clientWidth === 0) return;

    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex >= 0 && newIndex < total && !isScrollingRef.current) {
      setCurrentIndex(newIndex);
    }
  }, [total]);

  const scrollToSlide = useCallback((index: number) => {
    if (!trackRef.current) return;
    const clientWidth = trackRef.current.clientWidth;
    isScrollingRef.current = true;
    trackRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 450);
  }, []);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    const nextIdx = (currentIndex + 1) % total;
    scrollToSlide(nextIdx);
  }, [currentIndex, total, scrollToSlide]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    const prevIdx = (currentIndex - 1 + total) % total;
    scrollToSlide(prevIdx);
  }, [currentIndex, total, scrollToSlide]);

  // Keyboard navigation
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
      role="region"
      tabIndex={0}
    >
      {/* Pistas de imágenes deslizables con scroll snap nativo */}
      <div
        className="dish-carousel-track"
        onScroll={handleScroll}
        ref={trackRef}
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

      {/* Botón Flecha Anterior */}
      <button
        aria-label="Foto anterior"
        className="dish-carousel-nav-btn is-prev"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        title="Ver foto anterior"
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="20"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Botón Flecha Siguiente */}
      <button
        aria-label="Foto siguiente"
        className="dish-carousel-nav-btn is-next"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        title="Ver foto siguiente"
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="20"
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
              scrollToSlide(idx);
            }}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

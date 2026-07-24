"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface ProductCarouselProps {
  images: string[];
  productName: string;
  aspectRatio?: string;
  onImageClick?: (index: number) => void;
  showThumbnails?: boolean;
}

export default function ProductCarousel({
  images,
  productName,
  aspectRatio = "aspect-square",
  onImageClick,
  showThumbnails = true,
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback if no images provided
  const validImages = images && images.length > 0
    ? images
    : ["https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400"];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  return (
    <div className="w-full flex flex-col gap-2 group/carousel select-none">
      {/* Main Container */}
      <div
        className={`relative w-full ${aspectRatio} rounded-2xl bg-stone-100 overflow-hidden border border-stone-100/80 cursor-pointer`}
        onClick={() => onImageClick?.(currentIndex)}
      >
        <img
          src={validImages[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover/carousel:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400";
          }}
        />

        {/* Multiple Images Carousel Controls */}
        {validImages.length > 1 && (
          <>
            {/* Left Chevron */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-stone-200 text-stone-800 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right Chevron */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-stone-200 text-stone-800 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Counter Badge */}
            <span className="absolute bottom-2 right-2 z-10 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider">
              {currentIndex + 1} / {validImages.length}
            </span>

            {/* Pagination Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-stone-900/40 backdrop-blur-xs px-2 py-1 rounded-full">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === idx
                      ? "w-4 bg-emerald-400"
                      : "w-1.5 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {showThumbnails && validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-stone-50 ${
                currentIndex === idx
                  ? "border-emerald-600 ring-2 ring-emerald-500/20 scale-105"
                  : "border-stone-200 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

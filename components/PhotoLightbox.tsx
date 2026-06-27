"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  image_url: string;
  caption?: string | null;
}

interface PhotoLightboxProps {
  photos: Photo[];
  albumTitle: string;
}

export default function PhotoLightbox({ photos, albumTitle }: PhotoLightboxProps) {
  const [index, setIndex] = useState<number | null>(null);

  // Close lightbox
  const close = () => setIndex(null);

  // Navigate next
  const next = useCallback(() => {
    if (index === null) return;
    setIndex((prevIndex) => (prevIndex! + 1) % photos.length);
  }, [index, photos.length]);

  // Navigate previous
  const prev = useCallback(() => {
    if (index === null) return;
    setIndex((prevIndex) => (prevIndex! - 1 + photos.length) % photos.length);
  }, [index, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (index === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, next, prev]);

  // Prevent scroll when lightbox is open
  useEffect(() => {
    if (index !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [index]);

  return (
    <>
      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <figure
            key={photo.id}
            onClick={() => setIndex(i)}
            className="bg-white border border-line rounded-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
              <Image
                src={photo.image_url}
                alt={photo.caption ?? albumTitle}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/90 text-ink text-xs font-mono uppercase px-2 py-1 rounded-sm tracking-wider shadow-sm">
                  Lihat Foto
                </span>
              </div>
            </div>
            {photo.caption && (
              <figcaption className="font-mono text-xs text-slate px-3 py-2 border-t border-line truncate">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {index !== null && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center select-none"
        >
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-5 right-5 text-white/70 hover:text-white font-mono text-2xl p-2 focus:outline-none transition-colors z-50"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Navigation Controls (If there's more than 1 photo) */}
          {photos.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl transition-colors focus:outline-none z-50"
                aria-label="Previous photo"
              >
                ‹
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl transition-colors focus:outline-none z-50"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          {/* Photo Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-[90vw] max-h-[85vh] relative"
          >
            {/* The Image */}
            <div className="relative w-[90vw] h-[75vh]">
              <img
                src={photos[index].image_url}
                alt={photos[index].caption ?? albumTitle}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption & Index Indicator */}
            <div className="mt-4 text-center max-w-xl">
              {photos[index].caption && (
                <p className="text-white/90 font-body text-sm px-4">
                  {photos[index].caption}
                </p>
              )}
              <p className="text-white/40 font-mono text-xs mt-1">
                {index + 1} / {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

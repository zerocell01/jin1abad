"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { deletePhotos } from "@/app/gallery/[id]/actions";

interface Photo {
  id: string;
  image_url: string;
  caption?: string | null;
}

interface PhotoLightboxProps {
  photos: Photo[];
  albumTitle: string;
  albumId: string;
  isEditable: boolean;
}

export default function PhotoLightbox({
  photos,
  albumTitle,
  albumId,
  isEditable,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState<number | null>(null);

  // Manage Mode for Batch Deletion
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Download logic
  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(imageUrl, "_blank");
    }
  };

  // Delete Single Photo (from lightbox)
  const handleDeleteSingle = async (photoId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;
    try {
      setIsDeleting(true);
      const res = await deletePhotos(albumId, [photoId]);
      if (res.success) {
        close();
      } else {
        alert("Gagal menghapus foto: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus foto.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle selection for batch delete
  const toggleSelect = (photoId: string) => {
    setSelectedIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map((p) => p.id));
    }
  };

  // Delete Selected Photos
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} foto terpilih?`
      )
    )
      return;

    try {
      setIsDeleting(true);
      const res = await deletePhotos(albumId, selectedIds);
      if (res.success) {
        setSelectedIds([]);
        setIsManageMode(false);
      } else {
        alert("Gagal menghapus foto-foto terpilih: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus foto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Manage Mode Toolbar for Owner/Admin */}
      {isEditable && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-line rounded-sm p-3 mb-4 text-sm font-mono z-10 relative">
          <div className="flex items-center gap-3">
            {isManageMode ? (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedIds.length === photos.length && photos.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded-sm accent-maroon"
                />
                Pilih Semua ({selectedIds.length} / {photos.length})
              </label>
            ) : (
              <span className="text-slate">Pemilik Album</span>
            )}
          </div>

          <div className="flex gap-2">
            {isManageMode ? (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0 || isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-body px-3 py-1.5 rounded-sm disabled:opacity-50 text-xs font-semibold"
                >
                  {isDeleting ? "Menghapus..." : "Hapus Terpilih"}
                </button>
                <button
                  onClick={() => {
                    setIsManageMode(false);
                    setSelectedIds([]);
                  }}
                  className="border border-line hover:bg-slate-50 px-3 py-1.5 rounded-sm text-xs"
                >
                  Batal
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsManageMode(true)}
                className="bg-maroon text-paper hover:bg-maroon-dark px-3 py-1.5 rounded-sm text-xs"
              >
                Kelola Foto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <figure
            key={photo.id}
            onClick={() => {
              if (isManageMode) {
                toggleSelect(photo.id);
              } else {
                setIndex(i);
              }
            }}
            className={`bg-white border rounded-sm overflow-hidden cursor-pointer hover:shadow-md transition-all select-none relative group ${
              isManageMode && selectedIds.includes(photo.id)
                ? "border-maroon ring-1 ring-maroon"
                : "border-line"
            }`}
          >
            {/* Batch Select Checkbox (visible in manage mode) */}
            {isManageMode && (
              <div className="absolute top-2 left-2 z-20">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(photo.id)}
                  onChange={() => {}} // handled by click on card
                  className="h-4 w-4 rounded-sm accent-maroon border-line bg-white shadow-sm pointer-events-none"
                />
              </div>
            )}

            <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
              <Image
                src={photo.image_url}
                alt={photo.caption ?? albumTitle}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              {/* Overlay on hover (disabled in manage mode) */}
              {!isManageMode && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="bg-white/90 text-ink text-xs font-mono uppercase px-2 py-1 rounded-sm tracking-wider shadow-sm">
                    Lihat Foto
                  </span>
                </div>
              )}
            </div>

            {/* Quick Download Button on Thumbnail */}
            {!isManageMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(photo.image_url, `foto-${i + 1}.jpg`);
                }}
                className="absolute bottom-10 right-2 z-10 bg-white/90 hover:bg-white text-ink rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Unduh foto"
              >
                📥
              </button>
            )}

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
            <div className="relative w-[90vw] h-[70vh]">
              <img
                src={photos[index].image_url}
                alt={photos[index].caption ?? albumTitle}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Actions Bar (Download & Delete) */}
            <div className="flex gap-4 mt-3 z-50 font-mono text-xs">
              <button
                onClick={() =>
                  handleDownload(photos[index].image_url, `foto-${index + 1}.jpg`)
                }
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-sm transition-colors"
              >
                📥 Unduh Original
              </button>

              {isEditable && (
                <button
                  onClick={() => handleDeleteSingle(photos[index].id)}
                  disabled={isDeleting}
                  className="bg-red-600/80 hover:bg-red-700 text-white px-3 py-1.5 rounded-sm transition-colors disabled:opacity-50"
                >
                  🗑️ Hapus Foto
                </button>
              )}
            </div>

            {/* Caption & Index Indicator */}
            <div className="mt-3 text-center max-w-xl">
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

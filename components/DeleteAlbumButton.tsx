"use client";

import { useState } from "react";
import { deleteAlbum } from "@/app/gallery/[id]/actions";
import { useRouter } from "next/navigation";

export default function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus album ini beserta seluruh fotonya secara permanen?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await deleteAlbum(albumId);
      if (res.success) {
        alert("Album berhasil dihapus.");
        router.push("/gallery");
        router.refresh();
      } else {
        alert("Gagal menghapus album: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus album.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase px-3.5 py-2 rounded-sm transition-colors disabled:opacity-50 font-semibold shadow-sm"
    >
      {loading ? "Menghapus..." : "🗑️ Hapus Album"}
    </button>
  );
}

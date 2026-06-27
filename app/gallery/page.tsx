import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function GalleryPage() {
  const supabase = createClient();

  const { data: albums } = await supabase
    .from("albums")
    .select(
      "id, title, description, angkatan, created_at, photos(image_url)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Kenangan
      </p>
      <h1 className="font-display text-3xl mb-8">Galeri Foto</h1>

      {!albums || albums.length === 0 ? (
        <p className="text-slate font-body">Belum ada album foto.</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {albums.map((album: any) => (
            <Link href={`/gallery/${album.id}`} key={album.id} className="group">
              <div className="relative w-full aspect-square bg-white border border-line rounded-sm overflow-hidden mb-2">
                {album.photos?.[0]?.image_url ? (
                  <Image
                    src={album.photos[0].image_url}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate font-mono text-xs">
                    Belum ada foto
                  </div>
                )}
              </div>
              <p className="font-display text-base group-hover:text-maroon">
                {album.title}
              </p>
              <p className="font-mono text-xs text-slate">
                {album.angkatan ? `Angkatan ${album.angkatan} · ` : ""}
                {album.photos?.length ?? 0} foto
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

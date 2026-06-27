import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PhotoLightbox from "@/components/PhotoLightbox";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: album } = await supabase
    .from("albums")
    .select("title, description, photos(image_url)")
    .eq("id", params.id)
    .single();

  if (!album) return {};

  const firstPhoto = (album.photos as any[])?.[0]?.image_url;

  return {
    title: album.title,
    description: album.description ?? `Album foto ${album.title}`,
    openGraph: {
      title: album.title,
      description: album.description ?? `Album foto ${album.title}`,
      images: firstPhoto ? [firstPhoto] : undefined,
    },
  };
}

export default async function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: album } = await supabase
    .from("albums")
    .select("*, creator:profiles(full_name)")
    .eq("id", params.id)
    .single();

  if (!album) notFound();

  // Get user profile to check if admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const isEditable = !!user && (album.created_by === user.id || isAdmin);

  const { data: photos } = await supabase
    .from("photos")
    .select("id, image_url, caption")
    .eq("album_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Album
      </p>
      <h1 className="font-display text-3xl mb-2">{album.title}</h1>
      <p className="font-body text-sm text-slate mb-8">
        {album.description ? `${album.description} · ` : ""}
        dibuat oleh {album.creator?.full_name ?? "Alumni"}
      </p>

      {!photos || photos.length === 0 ? (
        <p className="text-slate font-body">Belum ada foto di album ini.</p>
      ) : (
        <PhotoLightbox
          photos={photos}
          albumTitle={album.title}
          albumId={album.id}
          isEditable={isEditable}
        />
      )}
    </div>
  );
}

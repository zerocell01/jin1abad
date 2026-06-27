"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePhotos(albumId: string, photoIds: string[]) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Verify that the user owns the album or is an admin
  const { data: album } = await supabase
    .from("albums")
    .select("created_by")
    .eq("id", albumId)
    .single();

  if (!album) return { success: false, error: "Album tidak ditemukan" };

  // Get user role to check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCreator = album.created_by === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isCreator && !isAdmin) {
    return { success: false, error: "Anda tidak berhak menghapus foto di album ini" };
  }

  // 2. Fetch photo URLs to delete them from storage
  const { data: photosToDelete } = await supabase
    .from("photos")
    .select("image_url")
    .in("id", photoIds);

  if (photosToDelete && photosToDelete.length > 0) {
    const paths = photosToDelete.map((p) => {
      const parts = p.image_url.split("/album-photos/");
      return parts[parts.length - 1];
    });

    // Remove from storage
    await supabase.storage.from("album-photos").remove(paths);
  }

  // 3. Delete from database
  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .in("id", photoIds);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath(`/gallery/${albumId}`);
  revalidatePath("/gallery");
  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadPhotos(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const albumId = formData.get("album_id") as string;
  const caption = formData.get("caption") as string;
  const files = formData.getAll("photos") as File[];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop();
    const path = `${albumId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("album-photos")
      .upload(path, file);

    if (uploadError) continue;

    const { data: publicUrl } = supabase.storage
      .from("album-photos")
      .getPublicUrl(path);

    await supabase.from("photos").insert({
      album_id: albumId,
      image_url: publicUrl.publicUrl,
      caption: caption || null,
      uploaded_by: user!.id,
    });
  }

  revalidatePath(`/gallery/${albumId}`);
  revalidatePath("/gallery");
  redirect(`/gallery/${albumId}`);
}

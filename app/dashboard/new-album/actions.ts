"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createAlbum(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const angkatanRaw = formData.get("angkatan") as string;

  const { data: album, error } = await supabase
    .from("albums")
    .insert({
      title,
      description,
      angkatan: angkatanRaw ? Number(angkatanRaw) : null,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (error || !album) {
    redirect(`/dashboard/new-album?error=${encodeURIComponent(error?.message ?? "Gagal membuat album")}`);
  }

  revalidatePath("/gallery");
  redirect(`/dashboard/new-album/${album.id}/upload`);
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const angkatanRaw = formData.get("angkatan") as string;
  const avatarFile = formData.get("avatar") as File | null;

  const updates: Record<string, any> = {
    full_name: formData.get("full_name") as string,
    angkatan: angkatanRaw ? Number(angkatanRaw) : null,
    kelas: formData.get("kelas") as string,
    pekerjaan: formData.get("pekerjaan") as string,
    bio: formData.get("bio") as string,
    alamat: formData.get("alamat") as string,
    desa: formData.get("desa") as string,
    kecamatan: formData.get("kecamatan") as string,
    kabupaten: formData.get("kabupaten") as string,
    provinsi: formData.get("provinsi") as string,
    show_address: formData.get("show_address") === "on",
    asal_alamat: formData.get("asal_alamat") as string,
    asal_desa: formData.get("asal_desa") as string,
    asal_kecamatan: formData.get("asal_kecamatan") as string,
    asal_kabupaten: formData.get("asal_kabupaten") as string,
    asal_provinsi: formData.get("asal_provinsi") as string,
    asal_show_address: formData.get("asal_show_address") === "on",
    whatsapp: formData.get("whatsapp") as string,
    show_contact: formData.get("show_contact") === "on",
  };

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile);
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
      updates.avatar_url = publicUrl.publicUrl;
    }
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user!.id);

  if (error) {
    redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/alumni");
  redirect("/dashboard?updated=1");
}

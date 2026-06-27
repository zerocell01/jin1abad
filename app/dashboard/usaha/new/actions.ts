"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitBusiness(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const link = formData.get("link") as string;
  const location = formData.get("location") as string;
  const photoFile = formData.get("photo") as File | null;

  let imageUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .upload(path, photoFile);
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from("business-photos")
        .getPublicUrl(path);
      imageUrl = publicUrl.publicUrl;
    }
  }

  const { error } = await supabase.from("businesses").insert({
    owner_id: user!.id,
    name,
    category,
    description,
    whatsapp,
    link,
    location,
    image_url: imageUrl,
    status: "pending",
  });

  if (error) {
    redirect(`/dashboard/usaha/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/usaha");
  redirect("/dashboard?business_submitted=1");
}

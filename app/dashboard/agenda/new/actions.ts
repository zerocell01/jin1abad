"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/agenda");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const eventDate = formData.get("event_date") as string;
  const coverFile = formData.get("cover") as File | null;

  let coverImageUrl: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("post-covers")
      .upload(path, coverFile);
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from("post-covers")
        .getPublicUrl(path);
      coverImageUrl = publicUrl.publicUrl;
    }
  }

  const { error } = await supabase.from("events").insert({
    title,
    description,
    location,
    event_date: eventDate,
    cover_image_url: coverImageUrl,
    created_by: user!.id,
  });

  if (error) {
    redirect(`/dashboard/agenda/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/agenda");
  redirect("/agenda?created=1");
}

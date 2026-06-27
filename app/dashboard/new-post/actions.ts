"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
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

  const { error } = await supabase.from("posts").insert({
    author_id: user!.id,
    title,
    content,
    cover_image_url: coverImageUrl,
    status: "pending",
  });

  if (error) {
    redirect(`/dashboard/new-post?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?posted=1");
}

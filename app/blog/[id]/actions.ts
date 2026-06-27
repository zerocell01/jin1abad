"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function reactToPost(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const postId = formData.get("post_id") as string;
  const reaction = formData.get("reaction") as string;

  if (!user) redirect(`/login`);

  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id, reaction")
    .eq("post_id", postId)
    .eq("profile_id", user!.id)
    .maybeSingle();

  if (existing && existing.reaction === reaction) {
    // Klik reaksi yang sama lagi → batalkan reaksinya
    await supabase.from("post_reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("post_reactions").upsert(
      { post_id: postId, profile_id: user!.id, reaction },
      { onConflict: "post_id,profile_id" }
    );
  }

  revalidatePath(`/blog/${postId}`);
}

export async function addComment(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const postId = formData.get("post_id") as string;
  const content = formData.get("content") as string;

  if (!content?.trim()) {
    redirect(`/blog/${postId}?error=Komentar%20tidak%20boleh%20kosong`);
  }

  await supabase.from("comments").insert({
    post_id: postId,
    author_id: user!.id,
    content: content.trim(),
  });

  revalidatePath(`/blog/${postId}`);
}

export async function deleteComment(formData: FormData) {
  const supabase = createClient();
  const commentId = formData.get("comment_id") as string;
  const postId = formData.get("post_id") as string;

  await supabase.from("comments").delete().eq("id", commentId);

  revalidatePath(`/blog/${postId}`);
}

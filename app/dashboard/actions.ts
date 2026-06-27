"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approvePost(formData: FormData) {
  const supabase = createClient();
  const postId = formData.get("post_id") as string;

  await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId);

  revalidatePath("/dashboard");
  revalidatePath("/blog");
}

export async function rejectPost(formData: FormData) {
  const supabase = createClient();
  const postId = formData.get("post_id") as string;

  await supabase.from("posts").update({ status: "rejected" }).eq("id", postId);

  revalidatePath("/dashboard");
}

export async function verifyKas(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const kasId = formData.get("kas_id") as string;

  await supabase
    .from("kas_transactions")
    .update({
      status: "verified",
      verified_by: userData.user?.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", kasId);

  revalidatePath("/dashboard");
  revalidatePath("/kas");
}

export async function rejectKas(formData: FormData) {
  const supabase = createClient();
  const kasId = formData.get("kas_id") as string;

  await supabase.from("kas_transactions").update({ status: "rejected" }).eq("id", kasId);

  revalidatePath("/dashboard");
}

export async function approveBusiness(formData: FormData) {
  const supabase = createClient();
  const businessId = formData.get("business_id") as string;

  await supabase.from("businesses").update({ status: "approved" }).eq("id", businessId);

  revalidatePath("/dashboard");
  revalidatePath("/usaha");
}

export async function rejectBusiness(formData: FormData) {
  const supabase = createClient();
  const businessId = formData.get("business_id") as string;

  await supabase.from("businesses").update({ status: "rejected" }).eq("id", businessId);

  revalidatePath("/dashboard");
}

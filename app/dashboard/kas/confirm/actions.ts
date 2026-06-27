"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function confirmTransfer(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const amount = Number(formData.get("amount"));
  const transactionDate = formData.get("transaction_date") as string;
  const description = formData.get("description") as string;
  const isAnonymous = formData.get("is_anonymous") === "on";

  if (!amount || amount <= 0) {
    redirect("/dashboard/kas/confirm?error=Jumlah%20tidak%20valid");
  }

  const { error } = await supabase.from("kas_transactions").insert({
    type: "masuk",
    amount,
    description: description || null,
    category: "iuran/donasi",
    contributor_id: user!.id,
    is_anonymous: isAnonymous,
    submitted_by: user!.id,
    transaction_date: transactionDate || new Date().toISOString().slice(0, 10),
  });

  if (error) {
    redirect(`/dashboard/kas/confirm?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/kas");
  revalidatePath("/dashboard");
  redirect("/kas?confirmed=1");
}

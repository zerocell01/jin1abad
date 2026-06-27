"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function recordExpense(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const amount = Number(formData.get("amount"));
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const transactionDate = formData.get("transaction_date") as string;

  if (!amount || amount <= 0) {
    redirect("/dashboard/kas/new-expense?error=Jumlah%20tidak%20valid");
  }

  // Trigger di database akan otomatis set status 'verified' karena
  // pengguna ini admin — kalau bukan admin, RLS+trigger akan menahannya jadi pending.
  const { error } = await supabase.from("kas_transactions").insert({
    type: "keluar",
    amount,
    description,
    category: category || "operasional",
    submitted_by: user!.id,
    verified_by: user!.id,
    verified_at: new Date().toISOString(),
    status: "verified",
    transaction_date: transactionDate || new Date().toISOString().slice(0, 10),
  });

  if (error) {
    redirect(`/dashboard/kas/new-expense?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/kas");
  redirect("/kas?recorded=1");
}

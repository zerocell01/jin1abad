"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateKasSettings(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("kas_settings")
    .update({
      bank_name: formData.get("bank_name") as string,
      bank_account_number: formData.get("bank_account_number") as string,
      bank_account_holder: formData.get("bank_account_holder") as string,
      ewallet_name: formData.get("ewallet_name") as string,
      ewallet_number: formData.get("ewallet_number") as string,
      note: formData.get("note") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    redirect(`/dashboard/kas/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/kas");
  redirect("/kas?settings_updated=1");
}

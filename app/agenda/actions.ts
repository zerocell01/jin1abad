"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function rsvpEvent(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const eventId = formData.get("event_id") as string;
  const status = formData.get("status") as string;
  const jumlahOrang = Number(formData.get("jumlah_orang") || 1);
  const note = formData.get("note") as string;

  await supabase.from("event_rsvps").upsert(
    {
      event_id: eventId,
      profile_id: user!.id,
      status,
      jumlah_orang: jumlahOrang || 1,
      note: note || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,profile_id" }
  );

  revalidatePath(`/agenda/${eventId}`);
  revalidatePath("/agenda");
}

export async function deleteEvent(formData: FormData) {
  const supabase = createClient();
  const eventId = formData.get("event_id") as string;

  await supabase.from("events").delete().eq("id", eventId);

  revalidatePath("/agenda");
  redirect("/agenda");
}

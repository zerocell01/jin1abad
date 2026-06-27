import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
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

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Khusus Admin
      </p>
      <h1 className="font-display text-3xl mb-6">Buat Acara</h1>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={createEvent} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Judul Acara</label>
          <input
            name="title"
            placeholder="Reuni Akbar 2026"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Tanggal & Jam</label>
          <input
            type="datetime-local"
            name="event_date"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Lokasi</label>
          <input
            name="location"
            placeholder="Aula Madrasah / Gedung Serbaguna"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Foto Sampul (opsional)</label>
          <input type="file" name="cover" accept="image/*" className="w-full text-sm" />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Deskripsi</label>
          <textarea
            name="description"
            rows={5}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark w-fit"
        >
          Buat Acara
        </button>
      </form>
    </div>
  );
}

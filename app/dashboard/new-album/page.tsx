import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAlbum } from "./actions";

export default async function NewAlbumPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Album Baru
      </p>
      <h1 className="font-display text-3xl mb-6">Buat Album</h1>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={createAlbum} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Judul Album</label>
          <input
            name="title"
            placeholder="Reuni Akbar 2024"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Angkatan (opsional)</label>
          <input
            name="angkatan"
            type="number"
            placeholder="2018"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Deskripsi (opsional)</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark w-fit"
        >
          Buat & Lanjut Upload Foto
        </button>
      </form>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "./actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  return (
    <div className="max-w-xl">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Cerita Baru
      </p>
      <h1 className="font-display text-3xl mb-2">Tulis Cerita</h1>
      <p className="font-body text-sm text-slate mb-6">
        Cerita kamu akan ditinjau admin sebelum tayang di halaman publik.
      </p>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={createPost} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Judul</label>
          <input
            name="title"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Foto Sampul (opsional)</label>
          <input
            type="file"
            name="cover"
            accept="image/*"
            className="w-full text-sm"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Isi Cerita</label>
          <textarea
            name="content"
            rows={10}
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark w-fit"
        >
          Kirim untuk Ditinjau
        </button>
      </form>
    </div>
  );
}

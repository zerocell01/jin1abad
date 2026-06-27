import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitBusiness } from "./actions";

export default async function NewBusinessPage({
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
        Usaha Alumni
      </p>
      <h1 className="font-display text-3xl mb-2">Daftarkan Usaha Kamu</h1>
      <p className="font-body text-sm text-slate mb-6">
        Akan ditinjau admin dulu sebelum tampil di direktori publik.
      </p>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={submitBusiness} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Nama Usaha</label>
          <input
            name="name"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Kategori</label>
          <input
            name="category"
            placeholder="Kuliner, Jasa, Fashion, dll"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Foto (opsional)</label>
          <input type="file" name="photo" accept="image/*" className="w-full text-sm" />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Deskripsi</label>
          <textarea
            name="description"
            rows={4}
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Lokasi</label>
          <input
            name="location"
            placeholder="Kota / area jangkauan"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">No. WhatsApp</label>
          <input
            name="whatsapp"
            placeholder="62812xxxxxxx"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Link Toko/Sosmed (opsional)</label>
          <input
            name="link"
            placeholder="https://instagram.com/..."
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

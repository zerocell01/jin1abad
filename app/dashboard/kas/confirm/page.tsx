import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { confirmTransfer } from "./actions";

export default async function ConfirmTransferPage({
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
        Kas Alumni
      </p>
      <h1 className="font-display text-3xl mb-2">Konfirmasi Transfer</h1>
      <p className="font-body text-sm text-slate mb-6">
        Sudah transfer ke rekening kas? Isi form ini, nanti admin akan
        memverifikasi sebelum masuk ke riwayat transaksi publik.
      </p>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={confirmTransfer} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Jumlah (Rp)</label>
          <input
            type="number"
            name="amount"
            min={1}
            required
            placeholder="50000"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Tanggal Transfer</label>
          <input
            type="date"
            name="transaction_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Keterangan (opsional)</label>
          <input
            name="description"
            placeholder="Iuran bulan Juni"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <label className="flex items-center gap-2 font-body text-sm">
          <input type="checkbox" name="is_anonymous" />
          Sembunyikan nama saya di riwayat publik
        </label>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark w-fit"
        >
          Kirim Konfirmasi
        </button>
      </form>
    </div>
  );
}

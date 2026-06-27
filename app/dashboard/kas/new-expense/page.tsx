import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordExpense } from "./actions";

export default async function NewExpensePage({
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

  if (profile?.role !== "admin") redirect("/kas");

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Khusus Admin
      </p>
      <h1 className="font-display text-3xl mb-6">Catat Pengeluaran</h1>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={recordExpense} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Jumlah (Rp)</label>
          <input
            type="number"
            name="amount"
            min={1}
            required
            placeholder="150000"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Tanggal</label>
          <input
            type="date"
            name="transaction_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Kategori</label>
          <input
            name="category"
            placeholder="Acara, operasional, dll"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Keterangan</label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="Sewa tempat reuni akbar"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark w-fit"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}

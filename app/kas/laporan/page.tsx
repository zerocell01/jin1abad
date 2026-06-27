import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function LaporanKasPage({
  searchParams,
}: {
  searchParams: { dari?: string; sampai?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("kas_transactions")
    .select(
      "id, type, amount, description, category, is_anonymous, transaction_date, contributor:profiles(full_name)"
    )
    .eq("status", "verified")
    .order("transaction_date", { ascending: true });

  if (searchParams.dari) query = query.gte("transaction_date", searchParams.dari);
  if (searchParams.sampai) query = query.lte("transaction_date", searchParams.sampai);

  const { data: transactions } = await query;

  const totalMasuk =
    transactions
      ?.filter((t) => t.type === "masuk")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  const totalKeluar =
    transactions
      ?.filter((t) => t.type === "keluar")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const exportUrl = `/api/kas/export?${searchParams.dari ? `dari=${searchParams.dari}&` : ""}${
    searchParams.sampai ? `sampai=${searchParams.sampai}` : ""
  }`;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2 print:hidden">
        Kas Alumni
      </p>
      <div className="flex items-end justify-between mb-6 print:mb-2">
        <h1 className="font-display text-3xl">Laporan Kas</h1>
        <Link href="/kas" className="font-mono text-xs text-maroon hover:underline print:hidden">
          ← Kembali ke Kas
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 mb-8 print:hidden"
      >
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Dari Tanggal</label>
          <input
            type="date"
            name="dari"
            defaultValue={searchParams.dari}
            className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Sampai Tanggal</label>
          <input
            type="date"
            name="sampai"
            defaultValue={searchParams.sampai}
            className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper"
        >
          Terapkan
        </button>
        <PrintButton />
        <a
          href={exportUrl}
          className="bg-maroon text-paper px-4 py-2 rounded-sm text-sm hover:bg-maroon-dark"
        >
          Download Excel
        </a>
      </form>

      <div className="print:block">
        <p className="font-mono text-xs text-slate mb-4">
          Periode: {searchParams.dari || "awal"} s/d {searchParams.sampai || "sekarang"}
        </p>

        <table className="w-full text-sm font-body mb-6 border-collapse">
          <thead>
            <tr className="border-b border-ink text-left font-mono text-xs uppercase">
              <th className="py-2">Tanggal</th>
              <th className="py-2">Jenis</th>
              <th className="py-2">Keterangan</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {!transactions || transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-slate">
                  Tidak ada transaksi di periode ini.
                </td>
              </tr>
            ) : (
              transactions.map((t: any) => (
                <tr key={t.id} className="border-b border-line">
                  <td className="py-2 font-mono text-xs whitespace-nowrap">
                    {new Date(t.transaction_date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-2">{t.type === "masuk" ? "Masuk" : "Keluar"}</td>
                  <td className="py-2">
                    {t.type === "masuk"
                      ? t.is_anonymous
                        ? "Donasi (anonim)"
                        : t.contributor?.full_name ?? "Alumni"
                      : t.description ?? "-"}
                  </td>
                  <td className="py-2 text-right font-mono whitespace-nowrap">
                    {t.type === "masuk" ? "+" : "-"} {formatRupiah(Number(t.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex flex-col gap-1 font-mono text-sm max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Total Masuk</span>
            <span>{formatRupiah(totalMasuk)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Keluar</span>
            <span>{formatRupiah(totalKeluar)}</span>
          </div>
          <div className="flex justify-between border-t border-ink pt-1 font-display text-base">
            <span>Saldo</span>
            <span>{formatRupiah(totalMasuk - totalKeluar)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

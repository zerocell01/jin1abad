import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function KasPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: settings } = await supabase
    .from("kas_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: transactions } = await supabase
    .from("kas_transactions")
    .select(
      "id, type, amount, description, category, is_anonymous, transaction_date, contributor:profiles(full_name)"
    )
    .eq("status", "verified")
    .order("transaction_date", { ascending: false });

  const saldo =
    transactions?.reduce(
      (sum, t) => sum + (t.type === "masuk" ? Number(t.amount) : -Number(t.amount)),
      0
    ) ?? 0;

  const totalMasuk =
    transactions
      ?.filter((t) => t.type === "masuk")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const hasRekening =
    settings?.bank_name || settings?.ewallet_name;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Transparansi
      </p>
      <h1 className="font-display text-3xl mb-8">Kas Alumni</h1>

      <div className="rule-thick pb-8 mb-8">
        <p className="font-mono text-xs uppercase text-slate mb-1">Saldo Saat Ini</p>
        <p className="font-display text-5xl">{formatRupiah(saldo)}</p>
        <p className="font-mono text-xs text-slate mt-2">
          Total kas masuk: {formatRupiah(totalMasuk)}
        </p>

        <div className="flex gap-3 mt-6">
          {user ? (
            <Link
              href="/dashboard/kas/confirm"
              className="bg-maroon text-paper px-4 py-2 rounded-sm text-sm hover:bg-maroon-dark"
            >
              Konfirmasi Transfer
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-maroon text-paper px-4 py-2 rounded-sm text-sm hover:bg-maroon-dark"
            >
              Masuk untuk Konfirmasi Transfer
            </Link>
          )}
          <Link
            href="/kas/laporan"
            className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper"
          >
            Lihat Laporan
          </Link>
        </div>
      </div>

      {hasRekening && (
        <div className="rule pt-5 mb-10">
          <h2 className="font-display text-xl mb-3">Transfer ke</h2>
          <div className="grid sm:grid-cols-2 gap-4 font-body text-sm">
            {settings?.bank_name && (
              <div>
                <p className="font-mono text-xs uppercase text-slate">Bank</p>
                <p>{settings.bank_name}</p>
                <p className="font-mono">{settings.bank_account_number}</p>
                <p className="text-slate">a.n. {settings.bank_account_holder}</p>
              </div>
            )}
            {settings?.ewallet_name && (
              <div>
                <p className="font-mono text-xs uppercase text-slate">E-Wallet</p>
                <p>{settings.ewallet_name}</p>
                <p className="font-mono">{settings.ewallet_number}</p>
              </div>
            )}
          </div>
          {settings?.note && (
            <p className="font-body text-sm text-slate mt-4">{settings.note}</p>
          )}
        </div>
      )}

      <h2 className="font-display text-xl mb-4">Riwayat Transaksi</h2>
      {!transactions || transactions.length === 0 ? (
        <p className="text-slate font-body">Belum ada transaksi yang tercatat.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.map((t: any) => (
            <div key={t.id} className="rule pt-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-body text-sm">
                  {t.type === "masuk"
                    ? t.is_anonymous
                      ? "Donasi (anonim)"
                      : t.contributor?.full_name ?? "Alumni"
                    : t.description ?? "Pengeluaran"}
                </p>
                <p className="font-mono text-xs text-slate">
                  {new Date(t.transaction_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {t.category ? ` · ${t.category}` : ""}
                </p>
              </div>
              <p
                className={`font-mono text-sm whitespace-nowrap ${
                  t.type === "masuk" ? "text-maroon" : "text-slate"
                }`}
              >
                {t.type === "masuk" ? "+" : "-"} {formatRupiah(Number(t.amount))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

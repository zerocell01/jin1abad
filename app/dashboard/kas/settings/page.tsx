import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateKasSettings } from "./actions";

export default async function KasSettingsPage({
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

  const { data: settings } = await supabase
    .from("kas_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Khusus Admin
      </p>
      <h1 className="font-display text-3xl mb-6">Info Rekening Kas</h1>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={updateKasSettings} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Nama Bank</label>
            <input
              name="bank_name"
              defaultValue={settings?.bank_name ?? ""}
              placeholder="BCA"
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">No. Rekening</label>
            <input
              name="bank_account_number"
              defaultValue={settings?.bank_account_number ?? ""}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Atas Nama</label>
          <input
            name="bank_account_holder"
            defaultValue={settings?.bank_account_holder ?? ""}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-xs uppercase mb-1">E-Wallet (opsional)</label>
            <input
              name="ewallet_name"
              defaultValue={settings?.ewallet_name ?? ""}
              placeholder="DANA / GoPay"
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">No. E-Wallet</label>
            <input
              name="ewallet_number"
              defaultValue={settings?.ewallet_number ?? ""}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Catatan (opsional)</label>
          <textarea
            name="note"
            rows={2}
            defaultValue={settings?.note ?? ""}
            placeholder="Mohon transfer sesuai nominal & konfirmasi setelah transfer"
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

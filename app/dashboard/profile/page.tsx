import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";
import Avatar from "@/components/Avatar";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { welcome?: string; error?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Profil
      </p>
      <h1 className="font-display text-3xl mb-2">Data Alumni Kamu</h1>
      {searchParams.welcome && (
        <p className="text-sm text-slate font-body mb-4">
          Akun berhasil dibuat — lengkapi data kamu di bawah ini.
        </p>
      )}
      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={updateProfile} className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile?.avatar_url}
            fallback={String(profile?.angkatan ?? "—")}
            size={64}
          />
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Foto Profil</label>
            <input type="file" name="avatar" accept="image/*" className="text-sm" />
          </div>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Nama Lengkap</label>
          <input
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Angkatan</label>
            <input
              name="angkatan"
              type="number"
              defaultValue={profile?.angkatan ?? ""}
              placeholder="2012"
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase mb-1">Kelas</label>
            <select
              name="kelas"
              defaultValue={profile?.kelas ?? ""}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            >
              <option value="">Pilih kelas</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Pekerjaan</label>
          <input
            name="pekerjaan"
            defaultValue={profile?.pekerjaan ?? ""}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Bio Singkat</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile?.bio ?? ""}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>

        <div className="rule pt-4">
          <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-3">
            Alamat Asal
          </p>
          <p className="font-body text-xs text-slate mb-3">
            Kampung halaman / daerah asal kamu sebelum merantau (kalau ada).
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Desa</label>
              <input
                name="asal_desa"
                defaultValue={profile?.asal_desa ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Kecamatan</label>
              <input
                name="asal_kecamatan"
                defaultValue={profile?.asal_kecamatan ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Kabupaten</label>
              <input
                name="asal_kabupaten"
                defaultValue={profile?.asal_kabupaten ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Provinsi</label>
              <input
                name="asal_provinsi"
                defaultValue={profile?.asal_provinsi ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block font-mono text-xs uppercase mb-1">Alamat Lengkap (opsional)</label>
            <textarea
              name="asal_alamat"
              rows={2}
              defaultValue={profile?.asal_alamat ?? ""}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              name="asal_show_address"
              defaultChecked={profile?.asal_show_address ?? false}
            />
            Tampilkan alamat asal lengkap ke alumni lain
          </label>
        </div>

        <div className="rule pt-4">
          <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-3">
            Domisili Sekarang
          </p>
          <p className="font-body text-xs text-slate mb-3">
            Kota/kabupaten/provinsi dipakai untuk filter di Direktori, supaya
            alumni satu daerah mudah saling temu.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Desa</label>
              <input
                name="desa"
                defaultValue={profile?.desa ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Kecamatan</label>
              <input
                name="kecamatan"
                defaultValue={profile?.kecamatan ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Kabupaten</label>
              <input
                name="kabupaten"
                defaultValue={profile?.kabupaten ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">Provinsi</label>
              <input
                name="provinsi"
                defaultValue={profile?.provinsi ?? ""}
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block font-mono text-xs uppercase mb-1">Alamat Lengkap (opsional)</label>
            <textarea
              name="alamat"
              rows={2}
              defaultValue={profile?.alamat ?? ""}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
            />
          </div>
          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              name="show_address"
              defaultChecked={profile?.show_address ?? false}
            />
            Tampilkan alamat domisili lengkap ke alumni lain
          </label>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">No. WhatsApp</label>
          <input
            name="whatsapp"
            placeholder="62812xxxxxxx"
            defaultValue={profile?.whatsapp ?? ""}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <label className="flex items-center gap-2 font-body text-sm">
          <input
            type="checkbox"
            name="show_contact"
            defaultChecked={profile?.show_contact ?? false}
          />
          Tampilkan kontak ini ke alumni lain
        </label>

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

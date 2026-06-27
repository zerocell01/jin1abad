import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";

export default async function AlumniDirectoryPage({
  searchParams,
}: {
  searchParams: {
    angkatan?: string;
    kelas?: string;
    kota?: string;
    kabupaten?: string;
    provinsi?: string;
    asal_kota?: string;
    asal_kabupaten?: string;
    asal_provinsi?: string;
    q?: string;
  };
}) {
  const supabase = createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, angkatan, kelas, jurusan, pekerjaan, kota, kabupaten, provinsi, asal_kota, asal_kabupaten, asal_provinsi"
    )
    .order("angkatan", { ascending: false });

  if (searchParams.angkatan) {
    query = query.eq("angkatan", Number(searchParams.angkatan));
  }
  if (searchParams.kelas) {
    query = query.eq("kelas", searchParams.kelas);
  }
  if (searchParams.kota) {
    query = query.eq("kota", searchParams.kota);
  }
  if (searchParams.kabupaten) {
    query = query.eq("kabupaten", searchParams.kabupaten);
  }
  if (searchParams.provinsi) {
    query = query.eq("provinsi", searchParams.provinsi);
  }
  if (searchParams.asal_kota) {
    query = query.eq("asal_kota", searchParams.asal_kota);
  }
  if (searchParams.asal_kabupaten) {
    query = query.eq("asal_kabupaten", searchParams.asal_kabupaten);
  }
  if (searchParams.asal_provinsi) {
    query = query.eq("asal_provinsi", searchParams.asal_provinsi);
  }
  if (searchParams.q) {
    query = query.ilike("full_name", `%${searchParams.q}%`);
  }

  const { data: alumni } = await query;

  // Ambil daftar opsi unik untuk tiap filter (cuma yang ada dropdown-nya)
  const { data: filterSource } = await supabase
    .from("profiles")
    .select("angkatan, kelas, kota, kabupaten, provinsi");

  const uniq = (key: "angkatan" | "kelas" | "kota" | "kabupaten" | "provinsi") =>
    Array.from(
      new Set((filterSource ?? []).map((p: any) => p[key]).filter(Boolean))
    ).sort();

  const angkatanOptions = uniq("angkatan");
  const kelasOptions = uniq("kelas");
  const kotaOptions = uniq("kota");
  const kabupatenOptions = uniq("kabupaten");
  const provinsiOptions = uniq("provinsi");

  const activeFilters = [
    searchParams.angkatan && `Angkatan ${searchParams.angkatan}`,
    searchParams.kelas && `Kelas ${searchParams.kelas}`,
    searchParams.kota && `Kota ${searchParams.kota}`,
    searchParams.kabupaten && `Kab. ${searchParams.kabupaten}`,
    searchParams.provinsi && searchParams.provinsi,
    searchParams.asal_kota && `Asal: ${searchParams.asal_kota}`,
    searchParams.asal_kabupaten && `Asal Kab.: ${searchParams.asal_kabupaten}`,
    searchParams.asal_provinsi && `Asal: ${searchParams.asal_provinsi}`,
  ].filter(Boolean);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Direktori
      </p>
      <h1 className="font-display text-3xl mb-6">Cari Teman Seangkatan</h1>

      <form className="flex flex-wrap gap-3 mb-4" method="get">
        <input
          type="text"
          name="q"
          placeholder="Cari nama..."
          defaultValue={searchParams.q}
          className="border border-line rounded-sm px-3 py-2 bg-white text-sm flex-1 min-w-[160px] focus:outline-none focus:border-maroon"
        />
        <select
          name="angkatan"
          defaultValue={searchParams.angkatan ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
        >
          <option value="">Semua Angkatan</option>
          {angkatanOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          name="kelas"
          defaultValue={searchParams.kelas ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((v) => (
            <option key={v} value={v}>
              Kelas {v}
            </option>
          ))}
        </select>
        <select
          name="provinsi"
          defaultValue={searchParams.provinsi ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
        >
          <option value="">Semua Provinsi (Domisili)</option>
          {provinsiOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          name="kabupaten"
          defaultValue={searchParams.kabupaten ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
        >
          <option value="">Semua Kabupaten (Domisili)</option>
          {kabupatenOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          name="kota"
          defaultValue={searchParams.kota ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
        >
          <option value="">Semua Kota (Domisili)</option>
          {kotaOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper"
        >
          Cari
        </button>
      </form>

      <p className="font-mono text-xs text-slate mb-6">
        Mau cari berdasarkan alamat asal? Lihat{" "}
        <Link href="/persebaran?mode=asal" className="text-maroon underline">
          Peta Persebaran
        </Link>
        , klik daerahnya, otomatis terfilter di sini.
      </p>

      {activeFilters.length > 0 && (
        <p className="font-mono text-xs text-slate mb-6">
          Filter aktif: {activeFilters.join(" · ")} ·{" "}
          <Link href="/alumni" className="text-maroon underline">
            reset
          </Link>
        </p>
      )}

      {!alumni || alumni.length === 0 ? (
        <p className="text-slate font-body">Tidak ada alumni yang cocok.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {alumni.map((person) => (
            <Link
              href={`/alumni/${person.id}`}
              key={person.id}
              className="rule pt-4 flex items-center gap-4 group"
            >
              <Avatar src={person.avatar_url} fallback={String(person.angkatan ?? "—")} size={52} />
              <div>
                <p className="font-display text-lg group-hover:text-maroon">
                  {person.full_name}
                  {person.kelas ? (
                    <span className="font-mono text-xs text-slate"> · Kelas {person.kelas}</span>
                  ) : null}
                </p>
                <p className="font-body text-sm text-slate">
                  {person.jurusan ?? "Jurusan belum diisi"}
                  {person.pekerjaan ? ` · ${person.pekerjaan}` : ""}
                </p>
                {(person.kota || person.kabupaten || person.provinsi) && (
                  <p className="font-mono text-xs text-slate mt-0.5">
                    Domisili:{" "}
                    {[person.kota, person.kabupaten, person.provinsi]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {(person.asal_kota || person.asal_kabupaten || person.asal_provinsi) && (
                  <p className="font-mono text-xs text-slate mt-0.5">
                    Asal:{" "}
                    {[person.asal_kota, person.asal_kabupaten, person.asal_provinsi]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

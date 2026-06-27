import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type GeoData = {
  count: number;
  kotaMap: Record<string, number>;
  kabupatenMap: Record<string, number>;
};

function topEntries(map: Record<string, number>, n = 6) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default async function PersebaranPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const mode = searchParams.mode === "asal" ? "asal" : "domisili";
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("provinsi, kota, kabupaten, asal_provinsi, asal_kota, asal_kabupaten");

  const provField = mode === "asal" ? "asal_provinsi" : "provinsi";
  const kotaField = mode === "asal" ? "asal_kota" : "kota";
  const kabupatenField = mode === "asal" ? "asal_kabupaten" : "kabupaten";
  const filterParamProv = mode === "asal" ? "asal_provinsi" : "provinsi";
  const filterParamKota = mode === "asal" ? "asal_kota" : "kota";
  const filterParamKab = mode === "asal" ? "asal_kabupaten" : "kabupaten";

  const byProvinsi: Record<string, GeoData> = {};
  let tanpaProvinsi = 0;

  for (const p of (profiles ?? []) as any[]) {
    const prov = p[provField]?.trim();
    if (!prov) {
      tanpaProvinsi++;
      continue;
    }
    byProvinsi[prov] ??= { count: 0, kotaMap: {}, kabupatenMap: {} };
    byProvinsi[prov].count++;

    const kota = p[kotaField]?.trim();
    if (kota) {
      byProvinsi[prov].kotaMap[kota] = (byProvinsi[prov].kotaMap[kota] ?? 0) + 1;
    }
    const kabupaten = p[kabupatenField]?.trim();
    if (kabupaten) {
      byProvinsi[prov].kabupatenMap[kabupaten] =
        (byProvinsi[prov].kabupatenMap[kabupaten] ?? 0) + 1;
    }
  }

  const provinsiList = Object.entries(byProvinsi).sort(
    (a, b) => b[1].count - a[1].count
  );
  const maxCount = provinsiList[0]?.[1].count ?? 1;
  const totalAlumni = profiles?.length ?? 0;
  const totalTerisi = totalAlumni - tanpaProvinsi;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Persebaran
      </p>
      <h1 className="font-display text-3xl mb-4">Peta Persebaran Alumni</h1>

      <div className="flex gap-2 mb-6">
        <Link
          href="/persebaran?mode=domisili"
          className={`px-3 py-1.5 rounded-sm text-sm font-mono ${
            mode === "domisili"
              ? "bg-maroon text-paper"
              : "border border-line hover:border-maroon hover:text-maroon"
          }`}
        >
          Domisili Sekarang
        </Link>
        <Link
          href="/persebaran?mode=asal"
          className={`px-3 py-1.5 rounded-sm text-sm font-mono ${
            mode === "asal"
              ? "bg-maroon text-paper"
              : "border border-line hover:border-maroon hover:text-maroon"
          }`}
        >
          Alamat Asal
        </Link>
      </div>

      <p className="font-body text-sm text-slate mb-8">
        {totalTerisi} dari {totalAlumni} alumni sudah mengisi{" "}
        {mode === "asal" ? "alamat asal" : "domisili sekarang"}. Klik nama
        provinsi atau kota untuk lihat alumninya di direktori.
      </p>

      {provinsiList.length === 0 ? (
        <p className="text-slate font-body">
          Belum ada alumni yang mengisi data{" "}
          {mode === "asal" ? "alamat asal" : "domisili"}.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {provinsiList.map(([provinsi, data]) => {
            const widthPct = Math.max((data.count / maxCount) * 100, 4);
            const kotaTop = topEntries(data.kotaMap);
            const kabupatenTop = topEntries(data.kabupatenMap);

            return (
              <div key={provinsi} className="rule pt-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <Link
                    href={`/alumni?${filterParamProv}=${encodeURIComponent(provinsi)}`}
                    className="font-display text-lg hover:text-maroon"
                  >
                    {provinsi}
                  </Link>
                  <span className="font-mono text-xs text-slate">
                    {data.count} alumni
                  </span>
                </div>

                <div className="h-2 bg-line rounded-sm overflow-hidden mb-3">
                  <div
                    className="h-full bg-maroon rounded-sm"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                {(kotaTop.length > 0 || kabupatenTop.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {kotaTop.map(([kota, count]) => (
                      <Link
                        key={`kota-${kota}`}
                        href={`/alumni?${filterParamKota}=${encodeURIComponent(kota)}`}
                        className="font-mono text-xs border border-line rounded-sm px-2 py-1 hover:border-maroon hover:text-maroon"
                      >
                        {kota} · {count}
                      </Link>
                    ))}
                    {kabupatenTop.map(([kabupaten, count]) => (
                      <Link
                        key={`kab-${kabupaten}`}
                        href={`/alumni?${filterParamKab}=${encodeURIComponent(kabupaten)}`}
                        className="font-mono text-xs border border-line rounded-sm px-2 py-1 hover:border-maroon hover:text-maroon"
                      >
                        Kab. {kabupaten} · {count}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tanpaProvinsi > 0 && (
        <p className="font-mono text-xs text-slate mt-8">
          {tanpaProvinsi} alumni belum mengisi{" "}
          {mode === "asal" ? "alamat asal" : "domisili"} —{" "}
          <Link href="/dashboard/profile" className="text-maroon underline">
            lengkapi punyamu
          </Link>
          .
        </p>
      )}
    </div>
  );
}

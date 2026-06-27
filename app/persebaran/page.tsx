import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MapPersebaran from "@/components/MapPersebaran";

const COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Pati & surrounding kecamatan
  "pati": { lat: -6.7513, lng: 111.0381 },
  "margoyoso": { lat: -6.6067, lng: 111.0589 },
  "kajen": { lat: -6.6067, lng: 111.0589 },
  "tayu": { lat: -6.5367, lng: 111.0428 },
  "trangkil": { lat: -6.6781, lng: 111.0531 },
  "juwana": { lat: -6.7169, lng: 111.1506 },
  "cluwak": { lat: -6.5503, lng: 110.9575 },
  "dukuhseti": { lat: -6.4419, lng: 111.0389 },
  "wedarijaksa": { lat: -6.7022, lng: 111.0578 },
  "tlogowungu": { lat: -6.7119, lng: 110.9992 },
  "gembong": { lat: -6.7139, lng: 110.9317 },
  "pucakwangi": { lat: -6.8906, lng: 111.1539 },
  "winong": { lat: -6.8378, lng: 111.0844 },
  "jakenan": { lat: -6.7878, lng: 111.1350 },
  "jaken": { lat: -6.8406, lng: 111.2181 },
  "batangan": { lat: -6.7194, lng: 111.2339 },
  "gabus": { lat: -6.8164, lng: 111.0306 },
  "tambakromo": { lat: -6.8778, lng: 111.0489 },
  "kayen": { lat: -6.9064, lng: 110.9972 },
  "sukolilo": { lat: -6.9292, lng: 110.9231 },

  // Jepara
  "jepara": { lat: -6.5892, lng: 110.6789 },
  "kembang": { lat: -6.5167, lng: 110.7833 },
  "bangsri": { lat: -6.5292, lng: 110.7417 },
  "mlonggo": { lat: -6.5556, lng: 110.7042 },
  "batealit": { lat: -6.6436, lng: 110.7481 },
  "kalinyamatan": { lat: -6.7906, lng: 110.7061 },
  "welahan": { lat: -6.7978, lng: 110.6694 },
  "mayong": { lat: -6.7458, lng: 110.7675 },
  "pecangaan": { lat: -6.7456, lng: 110.7064 },
  "tahunan": { lat: -6.6267, lng: 110.6978 },
  "kedung": { lat: -6.6897, lng: 110.6558 },
  "donorojo": { lat: -6.4447, lng: 110.9161 },

  // Kudus
  "kudus": { lat: -6.8083, lng: 110.8417 },
  "gebog": { lat: -6.7194, lng: 110.8425 },
  "bae": { lat: -6.7725, lng: 110.8572 },
  "dawe": { lat: -6.7153, lng: 110.8925 },
  "mejobo": { lat: -6.8228, lng: 110.8872 },
  "undaan": { lat: -6.8994, lng: 110.8253 },
  "jati": { lat: -6.8378, lng: 110.8256 },
  "kaliwungu": { lat: -6.8028, lng: 110.7917 },
  "kota kudus": { lat: -6.8044, lng: 110.8406 },

  // Rembang
  "rembang": { lat: -6.7058, lng: 111.3439 },
  "lasem": { lat: -6.6947, lng: 111.4503 },
  "sulang": { lat: -6.7917, lng: 111.3414 },
  "bulu": { lat: -6.8778, lng: 111.3486 },
  "gunem": { lat: -6.8058, lng: 111.4586 },
  "pamotan": { lat: -6.7708, lng: 111.4886 },
  "sale": { lat: -6.8272, lng: 111.6111 },
  "kragan": { lat: -6.7094, lng: 111.6186 },
  "sluke": { lat: -6.6978, lng: 111.5286 },
  "sarang": { lat: -6.7286, lng: 111.6886 },
  "sedan": { lat: -6.7778, lng: 111.5586 },

  // Demak
  "demak": { lat: -6.8947, lng: 110.6386 },
  "mranggen": { lat: -7.0272, lng: 110.5186 },
  "karangawen": { lat: -7.0456, lng: 110.5886 },
  "sayung": { lat: -6.9386, lng: 110.4986 },

  // Other major cities
  "semarang": { lat: -6.9932, lng: 110.4203 },
  "surabaya": { lat: -7.2575, lng: 112.7521 },
  "jakarta": { lat: -6.2088, lng: 106.8456 },
  "yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "bandung": { lat: -6.9175, lng: 107.6191 },
  "solo": { lat: -7.5754, lng: 110.8243 },
  "surakarta": { lat: -7.5754, lng: 110.8243 },
  "malang": { lat: -7.9625, lng: 112.6308 },
  "bogor": { lat: -6.5971, lng: 106.8060 },
  "depok": { lat: -6.4025, lng: 106.7997 },
  "tangerang": { lat: -6.1783, lng: 106.6319 },
  "bekasi": { lat: -6.2383, lng: 106.9756 },
  "gresik": { lat: -7.1592, lng: 112.6519 },
  "sidoarjo": { lat: -7.4478, lng: 112.7183 },
  "pasuruan": { lat: -7.6417, lng: 112.9056 },
  "probolinggo": { lat: -7.7542, lng: 113.2158 },

  // Grobogan
  "grobogan": { lat: -7.0300, lng: 110.9211 },
  "penawangan": { lat: -7.0922, lng: 110.8306 },
  "kluwan": { lat: -7.0903, lng: 110.8472 },
};

const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "jawa tengah": { lat: -7.1509, lng: 110.1403 },
  "jawa timur": { lat: -7.5360, lng: 112.2384 },
  "jawa barat": { lat: -7.0909, lng: 107.6689 },
  "dki jakarta": { lat: -6.2088, lng: 106.8456 },
  "di yogyakarta": { lat: -7.8753, lng: 110.4262 },
  "banten": { lat: -6.4058, lng: 106.0609 },
  "bali": { lat: -8.4095, lng: 115.1889 },
  "nusa tenggara barat": { lat: -8.6529, lng: 117.3616 },
  "nusa tenggara timur": { lat: -8.6573, lng: 121.0794 },
  "aceh": { lat: 4.6951, lng: 96.7494 },
  "sumatera utara": { lat: 2.1121, lng: 99.1986 },
  "sumatera barat": { lat: -0.7399, lng: 100.8000 },
  "riau": { lat: 0.2933, lng: 101.7068 },
  "kepulauan riau": { lat: 3.9456, lng: 108.1428 },
  "jambi": { lat: -1.6186, lng: 102.7753 },
  "sumatera selatan": { lat: -3.3194, lng: 103.9144 },
  "bangka belitung": { lat: -2.7410, lng: 106.4406 },
  "bengkulu": { lat: -3.5778, lng: 102.3464 },
  "lampung": { lat: -4.5586, lng: 105.4000 },
  "kalimantan barat": { lat: -0.2789, lng: 111.4753 },
  "kalimantan tengah": { lat: -1.6814, lng: 113.3823 },
  "kalimantan selatan": { lat: -3.0926, lng: 115.2838 },
  "kalimantan timur": { lat: 1.6406, lng: 116.4194 },
  "kalimantan utara": { lat: 3.0731, lng: 116.0413 },
  "sulawesi utara": { lat: 0.6246, lng: 123.9750 },
  "gorontalo": { lat: 0.6999, lng: 122.4467 },
  "sulawesi tengah": { lat: -1.4300, lng: 121.4456 },
  "sulawesi barat": { lat: -2.8440, lng: 119.2320 },
  "sulawesi selatan": { lat: -3.6687, lng: 119.9740 },
  "sulawesi tenggara": { lat: -4.1449, lng: 122.1746 },
  "maluku": { lat: -3.2385, lng: 130.1453 },
  "maluku utara": { lat: 1.5700, lng: 127.8000 },
  "papua": { lat: -4.2699, lng: 138.0803 },
  "papua barat": { lat: -1.3361, lng: 133.1747 },
};

function getCoordinates(desa?: string, kecamatan?: string, kabupaten?: string, provinsi?: string) {
  const normDesa = desa?.toLowerCase().trim() || "";
  const normKec = kecamatan?.toLowerCase().trim() || "";
  const normKab = kabupaten?.toLowerCase().trim() || "";
  const normProv = provinsi?.toLowerCase().trim() || "";

  if (normDesa && COORDINATES[normDesa]) return COORDINATES[normDesa];

  if (COORDINATES[normKec]) return COORDINATES[normKec];
  
  const cleanKec = normKec.replace(/^(kecamatan|kec\.)\s+/g, "");
  if (COORDINATES[cleanKec]) return COORDINATES[cleanKec];

  const cleanKab = normKab.replace(/^(kabupaten|kab\.|kota)\s+/g, "");
  if (COORDINATES[cleanKab]) return COORDINATES[cleanKab];
  if (COORDINATES[normKab]) return COORDINATES[normKab];

  if (PROVINCE_COORDINATES[normProv]) return PROVINCE_COORDINATES[normProv];

  // Default coordinate with a slight random jitter to prevent stacked markers
  const baseLat = -6.75;
  const baseLng = 111.04;
  const jitterLat = (Math.random() - 0.5) * 0.15;
  const jitterLng = (Math.random() - 0.5) * 0.15;
  return { lat: baseLat + jitterLat, lng: baseLng + jitterLng };
}

type GeoData = {
  count: number;
  kecamatanMap: Record<string, number>;
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
    .select("full_name, angkatan, provinsi, kecamatan, kabupaten, desa, asal_provinsi, asal_kecamatan, asal_kabupaten, asal_desa");

  const provField = mode === "asal" ? "asal_provinsi" : "provinsi";
  const kecamatanField = mode === "asal" ? "asal_kecamatan" : "kecamatan";
  const kabupatenField = mode === "asal" ? "asal_kabupaten" : "kabupaten";
  const desaField = mode === "asal" ? "asal_desa" : "desa";
  const filterParamProv = mode === "asal" ? "asal_provinsi" : "provinsi";
  const filterParamKec = mode === "asal" ? "asal_kecamatan" : "kecamatan";
  const filterParamKab = mode === "asal" ? "asal_kabupaten" : "kabupaten";

  const byProvinsi: Record<string, GeoData> = {};
  let tanpaProvinsi = 0;

  for (const p of (profiles ?? []) as any[]) {
    const prov = p[provField]?.trim();
    if (!prov) {
      tanpaProvinsi++;
      continue;
    }
    byProvinsi[prov] ??= { count: 0, kecamatanMap: {}, kabupatenMap: {} };
    byProvinsi[prov].count++;

    const kecamatan = p[kecamatanField]?.trim();
    if (kecamatan) {
      byProvinsi[prov].kecamatanMap[kecamatan] = (byProvinsi[prov].kecamatanMap[kecamatan] ?? 0) + 1;
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

  // Group locations for Leaflet Map
  const mapData: Record<string, { name: string; count: number; lat: number; lng: number; details: string[] }> = {};

  for (const p of (profiles ?? []) as any[]) {
    const prov = p[provField]?.trim();
    if (!prov) continue;

    const kec = p[kecamatanField]?.trim() || "";
    const kab = p[kabupatenField]?.trim() || "";
    const desa = p[desaField]?.trim() || "";
    
    const name = desa 
      ? `Desa ${desa}, Kec. ${kec}, ${kab}` 
      : kec 
        ? `Kec. ${kec}, ${kab}` 
        : kab 
          ? `Kab. ${kab}` 
          : prov;
          
    const key = `${prov}-${kab}-${kec}-${desa}`.toLowerCase();

    if (!mapData[key]) {
      const coords = getCoordinates(desa, kec, kab, prov);
      mapData[key] = {
        name,
        count: 0,
        lat: coords.lat,
        lng: coords.lng,
        details: []
      };
    }
    mapData[key].count++;
    if (p.full_name) {
      mapData[key].details.push(`${p.full_name} (${p.angkatan || 2012})`);
    }
  }

  const mapLocations = Object.values(mapData);

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
        provinsi atau kecamatan untuk lihat alumninya di direktori.
      </p>

      {/* Interactive Map Section */}
      {totalTerisi > 0 && (
        <MapPersebaran locations={mapLocations} />
      )}

      {provinsiList.length === 0 ? (
        <p className="text-slate font-body">
          Belum ada alumni yang mengisi data{" "}
          {mode === "asal" ? "alamat asal" : "domisili"}.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {provinsiList.map(([provinsi, data]) => {
            const widthPct = Math.max((data.count / maxCount) * 100, 4);
            const kecamatanTop = topEntries(data.kecamatanMap);
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

                {(kecamatanTop.length > 0 || kabupatenTop.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {kecamatanTop.map(([kecamatan, count]) => (
                      <Link
                        key={`kec-${kecamatan}`}
                        href={`/alumni?${filterParamKec}=${encodeURIComponent(kecamatan)}`}
                        className="font-mono text-xs border border-line rounded-sm px-2 py-1 hover:border-maroon hover:text-maroon"
                      >
                        Kec. {kecamatan} · {count}
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

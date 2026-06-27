"use client";

import { useEffect, useState } from "react";

interface AreaItem {
  id: string;
  name: string;
}

interface AddressSelectorProps {
  prefix: string; // "asal" or "domisili"
  initialProvinsi?: string;
  initialKabupaten?: string;
  initialKecamatan?: string;
  initialDesa?: string;
}

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
};

export default function AddressSelector({
  prefix,
  initialProvinsi = "",
  initialKabupaten = "",
  initialKecamatan = "",
  initialDesa = "",
}: AddressSelectorProps) {
  // Names to be submitted in the form
  const provFieldName = prefix === "asal" ? "asal_provinsi" : "provinsi";
  const kabFieldName = prefix === "asal" ? "asal_kabupaten" : "kabupaten";
  const kecFieldName = prefix === "asal" ? "asal_kecamatan" : "kecamatan";
  const desaFieldName = prefix === "asal" ? "asal_desa" : "desa";

  // Data lists
  const [provinces, setProvinces] = useState<AreaItem[]>([]);
  const [regencies, setRegencies] = useState<AreaItem[]>([]);
  const [districts, setDistricts] = useState<AreaItem[]>([]);
  const [villages, setVillages] = useState<AreaItem[]>([]);

  // Selected IDs
  const [provId, setProvId] = useState<string>("");
  const [kabId, setKabId] = useState<string>("");
  const [kecId, setKecId] = useState<string>("");
  const [desaId, setDesaId] = useState<string>("");

  // Selected Names (Title Case for DB saving)
  const [provName, setProvName] = useState<string>(initialProvinsi);
  const [kabName, setKabName] = useState<string>(initialKabupaten);
  const [kecName, setKecName] = useState<string>(initialKecamatan);
  const [desaName, setDesaName] = useState<string>(initialDesa);

  const [loading, setLoading] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    async function fetchProvinces() {
      try {
        setLoading(true);
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const data = await res.json();
        setProvinces(data);

        // Chain initial province
        if (initialProvinsi) {
          const matched = data.find(
            (p: AreaItem) => p.name.toUpperCase() === initialProvinsi.toUpperCase()
          );
          if (matched) {
            setProvId(matched.id);
            setProvName(toTitleCase(matched.name));
          }
        }
      } catch (err) {
        console.error("Gagal memuat provinsi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, [initialProvinsi]);

  // Fetch regencies when province changes
  useEffect(() => {
    if (!provId) {
      setRegencies([]);
      return;
    }
    async function fetchRegencies() {
      try {
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`
        );
        const data = await res.json();
        setRegencies(data);

        // Chain initial regency
        if (initialKabupaten && !kabId) {
          const matched = data.find(
            (r: AreaItem) =>
              r.name.toUpperCase() === initialKabupaten.toUpperCase() ||
              toTitleCase(r.name).toUpperCase() === initialKabupaten.toUpperCase()
          );
          if (matched) {
            setKabId(matched.id);
            setKabName(toTitleCase(matched.name));
          }
        }
      } catch (err) {
        console.error("Gagal memuat kabupaten:", err);
      }
    }
    fetchRegencies();
  }, [provId, initialKabupaten]);

  // Fetch districts when regency changes
  useEffect(() => {
    if (!kabId) {
      setDistricts([]);
      return;
    }
    async function fetchDistricts() {
      try {
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kabId}.json`
        );
        const data = await res.json();
        setDistricts(data);

        // Chain initial district
        if (initialKecamatan && !kecId) {
          const matched = data.find(
            (d: AreaItem) => d.name.toUpperCase() === initialKecamatan.toUpperCase()
          );
          if (matched) {
            setKecId(matched.id);
            setKecName(toTitleCase(matched.name));
          }
        }
      } catch (err) {
        console.error("Gagal memuat kecamatan:", err);
      }
    }
    fetchDistricts();
  }, [kabId, initialKecamatan]);

  // Fetch villages when district changes
  useEffect(() => {
    if (!kecId) {
      setVillages([]);
      return;
    }
    async function fetchVillages() {
      try {
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kecId}.json`
        );
        const data = await res.json();
        setVillages(data);

        // Chain initial village
        if (initialDesa && !desaId) {
          const matched = data.find(
            (v: AreaItem) => v.name.toUpperCase() === initialDesa.toUpperCase()
          );
          if (matched) {
            setDesaId(matched.id);
            setDesaName(toTitleCase(matched.name));
          }
        }
      } catch (err) {
        console.error("Gagal memuat desa:", err);
      }
    }
    fetchVillages();
  }, [kecId, initialDesa]);

  // Handlers
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setProvId(id);
    const matched = provinces.find((p) => p.id === id);
    const name = matched ? toTitleCase(matched.name) : "";
    setProvName(name);

    // Reset children
    setKabId("");
    setKabName("");
    setKecId("");
    setKecName("");
    setDesaId("");
    setDesaName("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
  };

  const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setKabId(id);
    const matched = regencies.find((r) => r.id === id);
    const name = matched ? toTitleCase(matched.name) : "";
    setKabName(name);

    // Reset children
    setKecId("");
    setKecName("");
    setDesaId("");
    setDesaName("");
    setDistricts([]);
    setVillages([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setKecId(id);
    const matched = districts.find((d) => d.id === id);
    const name = matched ? toTitleCase(matched.name) : "";
    setKecName(name);

    // Reset children
    setDesaId("");
    setDesaName("");
    setVillages([]);
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setDesaId(id);
    const matched = villages.find((v) => v.id === id);
    const name = matched ? toTitleCase(matched.name) : "";
    setDesaName(name);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Province & Regency Select */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Provinsi</label>
          <select
            value={provId}
            onChange={handleProvinceChange}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon font-body text-sm"
          >
            <option value="">{loading ? "Memuat..." : "-- Pilih Provinsi --"}</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {toTitleCase(p.name)}
              </option>
            ))}
          </select>
          <input type="hidden" name={provFieldName} value={provName} />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase mb-1">Kabupaten/Kota</label>
          <select
            value={kabId}
            onChange={handleRegencyChange}
            disabled={!provId}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon font-body text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {!provId ? "Pilih provinsi dulu" : "-- Pilih Kabupaten/Kota --"}
            </option>
            {regencies.map((r) => (
              <option key={r.id} value={r.id}>
                {toTitleCase(r.name)}
              </option>
            ))}
          </select>
          <input type="hidden" name={kabFieldName} value={kabName} />
        </div>
      </div>

      {/* District & Village Select */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Kecamatan</label>
          <select
            value={kecId}
            onChange={handleDistrictChange}
            disabled={!kabId}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon font-body text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {!kabId ? "Pilih kabupaten dulu" : "-- Pilih Kecamatan --"}
            </option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {toTitleCase(d.name)}
              </option>
            ))}
          </select>
          <input type="hidden" name={kecFieldName} value={kecName} />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase mb-1">Desa/Kelurahan</label>
          <select
            value={desaId}
            onChange={handleVillageChange}
            disabled={!kecId}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon font-body text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {!kecId ? "Pilih kecamatan dulu" : "-- Pilih Desa/Kelurahan --"}
            </option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {toTitleCase(v.name)}
              </option>
            ))}
          </select>
          <input type="hidden" name={desaFieldName} value={desaName} />
        </div>
      </div>
    </div>
  );
}

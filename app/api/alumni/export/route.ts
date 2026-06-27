import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return new Response("Unauthorized — silakan masuk dulu.", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return new Response("Forbidden — fitur ini khusus admin.", { status: 403 });
  }

  const { data: alumni } = await supabase
    .from("profiles")
    .select("*")
    .order("angkatan", { ascending: false });

  const rows = (alumni ?? []).map((p: any) => ({
    Nama: p.full_name,
    Angkatan: p.angkatan ?? "",
    Kelas: p.kelas ?? "",
    Jurusan: p.jurusan ?? "",
    Pekerjaan: p.pekerjaan ?? "",
    Perusahaan: p.perusahaan ?? "",
    "Domisili - Kota": p.kota ?? "",
    "Domisili - Kabupaten": p.kabupaten ?? "",
    "Domisili - Provinsi": p.provinsi ?? "",
    "Domisili - Alamat": p.alamat ?? "",
    "Asal - Kota": p.asal_kota ?? "",
    "Asal - Kabupaten": p.asal_kabupaten ?? "",
    "Asal - Provinsi": p.asal_provinsi ?? "",
    "Asal - Alamat": p.asal_alamat ?? "",
    WhatsApp: p.whatsapp ?? "",
    LinkedIn: p.linkedin_url ?? "",
    Bio: p.bio ?? "",
    Role: p.role ?? "",
    "Tanggal Daftar": p.created_at
      ? new Date(p.created_at).toLocaleDateString("id-ID")
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 10 },
    { wch: 8 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 16 },
    { wch: 24 },
    { wch: 30 },
    { wch: 8 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Alumni");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="data-alumni-jin1abad.xlsx"`,
    },
  });
}

import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  const dari = searchParams.get("dari");
  const sampai = searchParams.get("sampai");

  let query = supabase
    .from("kas_transactions")
    .select(
      "transaction_date, type, amount, category, description, is_anonymous, contributor:profiles(full_name)"
    )
    .eq("status", "verified")
    .order("transaction_date", { ascending: true });

  if (dari) query = query.gte("transaction_date", dari);
  if (sampai) query = query.lte("transaction_date", sampai);

  const { data: transactions } = await query;

  const rows = (transactions ?? []).map((t: any) => ({
    Tanggal: t.transaction_date,
    Jenis: t.type === "masuk" ? "Masuk" : "Keluar",
    Jumlah: Number(t.amount),
    Kategori: t.category ?? "",
    "Dari/Untuk":
      t.type === "masuk"
        ? t.is_anonymous
          ? "Anonim"
          : t.contributor?.full_name ?? "Alumni"
        : t.description ?? "",
    Keterangan: t.description ?? "",
  }));

  const totalMasuk = (transactions ?? [])
    .filter((t: any) => t.type === "masuk")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalKeluar = (transactions ?? [])
    .filter((t: any) => t.type === "keluar")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  rows.push({
    Tanggal: "",
    Jenis: "",
    Jumlah: 0,
    Kategori: "",
    "Dari/Untuk": "",
    Keterangan: "",
  } as any);
  rows.push({
    Tanggal: "TOTAL MASUK",
    Jenis: "",
    Jumlah: totalMasuk,
    Kategori: "",
    "Dari/Untuk": "",
    Keterangan: "",
  } as any);
  rows.push({
    Tanggal: "TOTAL KELUAR",
    Jenis: "",
    Jumlah: totalKeluar,
    Kategori: "",
    "Dari/Untuk": "",
    Keterangan: "",
  } as any);
  rows.push({
    Tanggal: "SALDO",
    Jenis: "",
    Jumlah: totalMasuk - totalKeluar,
    Kategori: "",
    "Dari/Untuk": "",
    Keterangan: "",
  } as any);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kas");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-kas${dari ? `-${dari}` : ""}${sampai ? `_${sampai}` : ""}.xlsx"`,
    },
  });
}

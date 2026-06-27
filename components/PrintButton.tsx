"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper print:hidden"
    >
      Cetak / Simpan PDF
    </button>
  );
}

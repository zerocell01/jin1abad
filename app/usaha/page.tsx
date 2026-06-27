import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function UsahaPage({
  searchParams,
}: {
  searchParams: { kategori?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("businesses")
    .select("id, name, category, description, location, image_url")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (searchParams.kategori) {
    query = query.eq("category", searchParams.kategori);
  }

  const { data: businesses } = await query;

  const { data: allApproved } = await supabase
    .from("businesses")
    .select("category")
    .eq("status", "approved");

  const categories = Array.from(
    new Set((allApproved ?? []).map((b) => b.category).filter(Boolean))
  ).sort();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Saling Dukung
      </p>
      <h1 className="font-display text-3xl mb-2">Usaha Alumni</h1>
      <p className="font-body text-sm text-slate mb-6">
        Sebelum cari di tempat lain, cek dulu siapa tau ada alumni yang jual.
      </p>

      {categories.length > 0 && (
        <form method="get" className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/usaha"
            className={`font-mono text-xs px-3 py-1.5 rounded-sm border ${
              !searchParams.kategori
                ? "bg-maroon text-paper border-maroon"
                : "border-line hover:border-maroon hover:text-maroon"
            }`}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/usaha?kategori=${encodeURIComponent(cat as string)}`}
              className={`font-mono text-xs px-3 py-1.5 rounded-sm border ${
                searchParams.kategori === cat
                  ? "bg-maroon text-paper border-maroon"
                  : "border-line hover:border-maroon hover:text-maroon"
              }`}
            >
              {cat}
            </Link>
          ))}
        </form>
      )}

      {!businesses || businesses.length === 0 ? (
        <p className="text-slate font-body">Belum ada usaha yang terdaftar.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {businesses.map((biz) => (
            <Link href={`/usaha/${biz.id}`} key={biz.id} className="rule pt-4 block group">
              <div className="flex gap-4">
                {biz.image_url && (
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-white border border-line">
                    <Image src={biz.image_url} alt={biz.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-display text-lg group-hover:text-maroon">{biz.name}</p>
                  {biz.category && (
                    <p className="font-mono text-xs text-maroon">{biz.category}</p>
                  )}
                  <p className="font-body text-sm text-slate mt-1 line-clamp-2">
                    {biz.description}
                  </p>
                  {biz.location && (
                    <p className="font-mono text-xs text-slate mt-1">📍 {biz.location}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

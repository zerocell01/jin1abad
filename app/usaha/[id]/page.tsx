import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BusinessDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: biz } = await supabase
    .from("businesses")
    .select("*, owner:profiles(id, full_name)")
    .eq("id", params.id)
    .single();

  if (!biz) notFound();

  return (
    <div className="max-w-xl">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Usaha Alumni
      </p>
      <h1 className="font-display text-3xl mb-1">{biz.name}</h1>
      {biz.category && (
        <p className="font-mono text-xs text-maroon mb-4">{biz.category}</p>
      )}

      {biz.image_url && (
        <div className="relative w-full aspect-[4/3] mb-6 rounded-sm overflow-hidden">
          <Image src={biz.image_url} alt={biz.name} fill className="object-cover" />
        </div>
      )}

      {biz.description && (
        <p className="font-body text-base leading-relaxed whitespace-pre-wrap mb-6">
          {biz.description}
        </p>
      )}

      <div className="rule pt-4 font-body text-sm flex flex-col gap-2">
        {biz.location && <p>📍 {biz.location}</p>}
        {biz.whatsapp && (
          <p>
            💬{" "}
            <a
              href={`https://wa.me/${biz.whatsapp}`}
              target="_blank"
              className="text-maroon underline"
            >
              Chat via WhatsApp
            </a>
          </p>
        )}
        {biz.link && (
          <p>
            🔗{" "}
            <a href={biz.link} target="_blank" className="text-maroon underline">
              {biz.link}
            </a>
          </p>
        )}
        <p className="text-slate font-mono text-xs mt-2">
          Punya{" "}
          <Link href={`/alumni/${biz.owner?.id}`} className="text-maroon underline">
            {biz.owner?.full_name ?? "Alumni"}
          </Link>
        </p>
      </div>
    </div>
  );
}

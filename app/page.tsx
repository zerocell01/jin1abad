import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author:profiles(full_name, angkatan, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const { count: alumniCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <section className="rule-thick pt-10 pb-14">
        <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-3">
          Jin1abad
        </p>
        <h1 className="font-display text-5xl leading-tight max-w-xl">
          Mutakhorrijin PIM 2012.
        </h1>
        <p className="font-body text-slate mt-4 max-w-md">
          Tempat Jin1abad tetap saling terhubung - cari teman seangkatan,
          baca cerita alumni, dan simpan kenangan lewat foto bersama.
        </p>
        <div className="flex gap-3 mt-7">
          <Link
            href="/alumni"
            className="bg-maroon text-paper px-4 py-2 rounded-sm font-body text-sm hover:bg-maroon-dark"
          >
            Lihat Direktori Alumni
          </Link>
          <Link
            href="/register"
            className="border border-ink px-4 py-2 rounded-sm font-body text-sm hover:bg-ink hover:text-paper"
          >
            Daftar sebagai Alumni
          </Link>
        </div>
        {alumniCount ? (
          <p className="font-mono text-xs text-slate mt-6">
            {alumniCount} alumni telah terdaftar
          </p>
        ) : null}
      </section>

      <section className="pt-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">Cerita Terbaru</h2>
          <Link href="/blog" className="font-mono text-xs text-maroon hover:underline">
            LIHAT SEMUA →
          </Link>
        </div>

        {!posts || posts.length === 0 ? (
          <p className="text-slate font-body">Belum ada cerita yang dipublikasikan.</p>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: any) => (
              <Link
                href={`/blog/${post.id}`}
                key={post.id}
                className="rule pt-5 block group"
              >
                <div className="flex items-start gap-4">
                  <Avatar src={post.author?.avatar_url} fallback={String(post.author?.angkatan ?? "—")} size={52} />
                  <div>
                    <h3 className="font-display text-xl group-hover:text-maroon">
                      {post.title}
                    </h3>
                    <p className="font-body text-sm text-slate mt-1">
                      oleh {post.author?.full_name ?? "Alumni"} ·{" "}
                      {new Date(post.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";

export default async function BlogListPage() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author:profiles(full_name, angkatan, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Cerita Alumni
      </p>
      <h1 className="font-display text-3xl mb-8">Cerita</h1>

      {!posts || posts.length === 0 ? (
        <p className="text-slate font-body">Belum ada cerita yang dipublikasikan.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post: any) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="rule pt-5 block group">
              <div className="flex items-start gap-4">
                <Avatar src={post.author?.avatar_url} fallback={String(post.author?.angkatan ?? "—")} size={52} />
                <div>
                  <h2 className="font-display text-xl group-hover:text-maroon">
                    {post.title}
                  </h2>
                  <p className="font-body text-sm text-slate mt-1">
                    oleh {post.author?.full_name ?? "Alumni"} ·{" "}
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-body text-sm mt-2 line-clamp-2 text-ink/80">
                    {post.content}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

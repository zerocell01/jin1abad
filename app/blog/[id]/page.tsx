import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { reactToPost, addComment, deleteComment } from "./actions";
import Avatar from "@/components/Avatar";

const REACTIONS = [
  { value: "suka", emoji: "👍", label: "Suka" },
  { value: "cinta", emoji: "❤️", label: "Kangen" },
  { value: "semangat", emoji: "🎉", label: "Semangat" },
];

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, content, cover_image_url")
    .eq("id", params.id)
    .single();

  if (!post) return {};

  const excerpt = post.content?.slice(0, 150) ?? "";

  return {
    title: post.title,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles(id, full_name, angkatan, avatar_url)")
    .eq("id", params.id)
    .single();

  if (!post) notFound();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  const { data: reactions } = await supabase
    .from("post_reactions")
    .select("reaction, profile_id")
    .eq("post_id", params.id);

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: reactions?.filter((x) => x.reaction === r.value).length ?? 0,
  }));
  const myReaction = reactions?.find((r) => r.profile_id === user?.id)?.reaction;

  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, author:profiles(id, full_name)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <article className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Cerita
      </p>
      <h1 className="font-display text-4xl leading-tight mb-4">{post.title}</h1>

      <div className="flex items-center gap-3 mb-8">
        <Avatar src={post.author?.avatar_url} fallback={String(post.author?.angkatan ?? "—")} size={40} />
        <p className="font-body text-sm text-slate">
          oleh{" "}
          <Link href={`/alumni/${post.author?.id}`} className="text-maroon underline">
            {post.author?.full_name ?? "Alumni"}
          </Link>{" "}
          ·{" "}
          {new Date(post.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {post.cover_image_url && (
        <div className="relative w-full aspect-[16/9] mb-8 rounded-sm overflow-hidden">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="font-body text-base leading-relaxed whitespace-pre-wrap mb-8">
        {post.content}
      </div>

      <div className="flex gap-2 mb-10 rule pt-5">
        {reactionCounts.map((r) => (
          <form action={reactToPost} key={r.value}>
            <input type="hidden" name="post_id" value={post.id} />
            <input type="hidden" name="reaction" value={r.value} />
            <button
              type="submit"
              className={`font-mono text-xs px-3 py-1.5 rounded-sm border flex items-center gap-1.5 ${
                myReaction === r.value
                  ? "bg-maroon text-paper border-maroon"
                  : "border-line hover:border-maroon hover:text-maroon"
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
              {r.count > 0 && <span>· {r.count}</span>}
            </button>
          </form>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl mb-4">
          Komentar {comments && comments.length > 0 ? `(${comments.length})` : ""}
        </h2>

        {user ? (
          <form action={addComment} className="flex flex-col gap-2 mb-6 max-w-lg">
            <input type="hidden" name="post_id" value={post.id} />
            {searchParams.error && (
              <p className="text-sm text-maroon">{searchParams.error}</p>
            )}
            <textarea
              name="content"
              rows={3}
              required
              placeholder="Tulis komentar..."
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
            />
            <button
              type="submit"
              className="bg-maroon text-paper px-4 py-2 rounded-sm text-sm hover:bg-maroon-dark w-fit"
            >
              Kirim Komentar
            </button>
          </form>
        ) : (
          <p className="font-body text-sm text-slate mb-6">
            <a href="/login" className="text-maroon underline">
              Masuk
            </a>{" "}
            dulu untuk ikut komentar.
          </p>
        )}

        {!comments || comments.length === 0 ? (
          <p className="text-sm text-slate font-body">Belum ada komentar.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c: any) => (
              <div key={c.id} className="rule pt-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-body text-sm font-medium">
                    {c.author?.full_name ?? "Alumni"}
                  </p>
                  <span className="font-mono text-xs text-slate">
                    {new Date(c.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="font-body text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                {(c.author?.id === user?.id || isAdmin) && (
                  <form action={deleteComment} className="mt-1">
                    <input type="hidden" name="comment_id" value={c.id} />
                    <input type="hidden" name="post_id" value={post.id} />
                    <button className="font-mono text-xs text-slate underline hover:text-maroon">
                      Hapus
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";

export default async function CariPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createClient();

  let alumni: any[] = [];
  let posts: any[] = [];
  let businesses: any[] = [];
  let albums: any[] = [];
  let events: any[] = [];

  if (q) {
    const [
      { data: alumniData },
      { data: postsData },
      { data: businessesData },
      { data: albumsData },
      { data: eventsData },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, angkatan, avatar_url, jurusan, pekerjaan")
        .or(`full_name.ilike.%${q}%,jurusan.ilike.%${q}%,pekerjaan.ilike.%${q}%`)
        .limit(10),
      supabase
        .from("posts")
        .select("id, title, content, author:profiles(full_name)")
        .eq("status", "published")
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .limit(10),
      supabase
        .from("businesses")
        .select("id, name, category, description")
        .eq("status", "approved")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
        .limit(10),
      supabase
        .from("albums")
        .select("id, title, description")
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(10),
      supabase
        .from("events")
        .select("id, title, location, event_date")
        .or(`title.ilike.%${q}%,location.ilike.%${q}%`)
        .limit(10),
    ]);

    alumni = alumniData ?? [];
    posts = postsData ?? [];
    businesses = businessesData ?? [];
    albums = albumsData ?? [];
    events = eventsData ?? [];
  }

  const totalResults =
    alumni.length + posts.length + businesses.length + albums.length + events.length;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Pencarian
      </p>
      <h1 className="font-display text-3xl mb-6">
        {q ? `Hasil untuk "${q}"` : "Cari di Jin1abad"}
      </h1>

      <form method="get" action="/cari" className="flex gap-2 mb-10 max-w-md">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cari nama, cerita, usaha, album, acara..."
          autoFocus
          className="flex-1 border border-line rounded-sm px-3 py-2 bg-white text-sm focus:outline-none focus:border-maroon"
        />
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm text-sm hover:bg-maroon-dark"
        >
          Cari
        </button>
      </form>

      {!q ? (
        <p className="text-slate font-body">
          Ketik nama alumni, judul cerita, nama usaha, album, atau acara di atas.
        </p>
      ) : totalResults === 0 ? (
        <p className="text-slate font-body">Tidak ada hasil yang cocok dengan "{q}".</p>
      ) : (
        <div className="flex flex-col gap-10">
          {alumni.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-3">Alumni ({alumni.length})</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {alumni.map((p) => (
                  <Link
                    href={`/alumni/${p.id}`}
                    key={p.id}
                    className="rule pt-4 flex items-center gap-3 group"
                  >
                    <Avatar src={p.avatar_url} fallback={String(p.angkatan ?? "—")} size={44} />
                    <div>
                      <p className="font-display text-base group-hover:text-maroon">
                        {p.full_name}
                      </p>
                      <p className="font-body text-xs text-slate">
                        {p.jurusan ?? ""}
                        {p.pekerjaan ? ` · ${p.pekerjaan}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-3">Cerita ({posts.length})</h2>
              <div className="flex flex-col gap-3">
                {posts.map((post: any) => (
                  <Link href={`/blog/${post.id}`} key={post.id} className="rule pt-3 block hover:text-maroon">
                    <p className="font-display text-base">{post.title}</p>
                    <p className="font-mono text-xs text-slate">
                      oleh {post.author?.full_name ?? "Alumni"}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {businesses.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-3">Usaha ({businesses.length})</h2>
              <div className="flex flex-col gap-3">
                {businesses.map((biz) => (
                  <Link href={`/usaha/${biz.id}`} key={biz.id} className="rule pt-3 block hover:text-maroon">
                    <p className="font-display text-base">{biz.name}</p>
                    {biz.category && (
                      <p className="font-mono text-xs text-maroon">{biz.category}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-3">Album ({albums.length})</h2>
              <div className="flex flex-col gap-3">
                {albums.map((album) => (
                  <Link href={`/gallery/${album.id}`} key={album.id} className="rule pt-3 block hover:text-maroon">
                    <p className="font-display text-base">{album.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {events.length > 0 && (
            <section>
              <h2 className="font-display text-xl mb-3">Acara ({events.length})</h2>
              <div className="flex flex-col gap-3">
                {events.map((event) => (
                  <Link href={`/agenda/${event.id}`} key={event.id} className="rule pt-3 block hover:text-maroon">
                    <p className="font-display text-base">{event.title}</p>
                    <p className="font-mono text-xs text-slate">
                      {new Date(event.event_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

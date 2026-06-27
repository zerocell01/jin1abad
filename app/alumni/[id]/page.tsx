import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";

export default async function AlumniProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: person } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!person) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .eq("author_id", params.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: albums } = await supabase
    .from("albums")
    .select("id, title")
    .eq("created_by", params.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-start gap-5 rule-thick pb-8 mb-8">
        <Avatar src={person.avatar_url} fallback={String(person.angkatan ?? "—")} size={80} className="text-base" />
        <div>
          <h1 className="font-display text-3xl">{person.full_name}</h1>
          <p className="font-body text-slate mt-1">
            {person.jurusan ?? "Jurusan belum diisi"}
            {person.kelas ? ` · Kelas ${person.kelas}` : ""}
          </p>
          {person.pekerjaan && (
            <p className="font-body text-sm text-slate mt-1">
              {person.pekerjaan}
              {person.perusahaan ? ` di ${person.perusahaan}` : ""}
            </p>
          )}
          {(person.kota || person.kabupaten || person.provinsi) && (
            <p className="font-mono text-xs text-slate mt-1">
              Domisili: {[person.kota, person.kabupaten, person.provinsi]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {(person.asal_kota || person.asal_kabupaten || person.asal_provinsi) && (
            <p className="font-mono text-xs text-slate mt-0.5">
              Asal: {[person.asal_kota, person.asal_kabupaten, person.asal_provinsi]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {person.bio && (
            <p className="font-body text-sm mt-4 max-w-md">{person.bio}</p>
          )}
          {person.show_address && person.alamat && (
            <p className="font-body text-sm mt-3 max-w-md">
              <span className="font-mono text-xs uppercase text-maroon block mb-1">
                Alamat Domisili
              </span>
              {person.alamat}
            </p>
          )}
          {person.asal_show_address && person.asal_alamat && (
            <p className="font-body text-sm mt-3 max-w-md">
              <span className="font-mono text-xs uppercase text-maroon block mb-1">
                Alamat Asal
              </span>
              {person.asal_alamat}
            </p>
          )}
          {person.show_contact && (person.linkedin_url || person.whatsapp) && (
            <div className="flex gap-3 mt-4 font-mono text-xs text-maroon">
              {person.linkedin_url && (
                <a href={person.linkedin_url} target="_blank" className="underline">
                  LinkedIn
                </a>
              )}
              {person.whatsapp && (
                <a href={`https://wa.me/${person.whatsapp}`} target="_blank" className="underline">
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl mb-3">Cerita</h2>
          {!posts || posts.length === 0 ? (
            <p className="text-sm text-slate font-body">Belum ada cerita.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.id}`} className="text-sm hover:text-maroon underline">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl mb-3">Album</h2>
          {!albums || albums.length === 0 ? (
            <p className="text-sm text-slate font-body">Belum ada album.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {albums.map((album) => (
                <li key={album.id}>
                  <Link href={`/gallery/${album.id}`} className="text-sm hover:text-maroon underline">
                    {album.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

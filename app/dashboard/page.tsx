import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approvePost, rejectPost, verifyKas, rejectKas, approveBusiness, rejectBusiness } from "./actions";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: myPosts } = await supabase
    .from("posts")
    .select("id, title, status, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const { data: myAlbums } = await supabase
    .from("albums")
    .select("id, title, photos(id)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const isAdmin = profile?.role === "admin";

  const { data: pendingPosts } = isAdmin
    ? await supabase
        .from("posts")
        .select("id, title, author:profiles(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
    : { data: null };

  const { data: pendingKas } = isAdmin
    ? await supabase
        .from("kas_transactions")
        .select("id, amount, description, transaction_date, contributor:profiles(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
    : { data: null };

  const { data: pendingBusinesses } = isAdmin
    ? await supabase
        .from("businesses")
        .select("id, name, category, owner:profiles(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
    : { data: null };

  let stats: {
    totalAlumni: number;
    totalCeritaTayang: number;
    totalUsahaApproved: number;
    totalAcaraMendatang: number;
    saldoKas: number;
  } | null = null;

  if (isAdmin) {
    const nowIso = new Date().toISOString();
    const [
      { count: totalAlumni },
      { count: totalCeritaTayang },
      { count: totalUsahaApproved },
      { count: totalAcaraMendatang },
      { data: kasVerified },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("events").select("id", { count: "exact", head: true }).gte("event_date", nowIso),
      supabase.from("kas_transactions").select("type, amount").eq("status", "verified"),
    ]);

    const saldoKas = (kasVerified ?? []).reduce(
      (sum: number, t: any) => sum + (t.type === "masuk" ? Number(t.amount) : -Number(t.amount)),
      0
    );

    stats = {
      totalAlumni: totalAlumni ?? 0,
      totalCeritaTayang: totalCeritaTayang ?? 0,
      totalUsahaApproved: totalUsahaApproved ?? 0,
      totalAcaraMendatang: totalAcaraMendatang ?? 0,
      saldoKas,
    };
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Dashboard
      </p>
      <h1 className="font-display text-3xl mb-1">
        Halo, {profile?.full_name ?? "Alumni"}
      </h1>
      <p className="font-body text-sm text-slate mb-8">
        <Link href="/dashboard/profile" className="text-maroon underline">
          Lengkapi / edit data alumni kamu
        </Link>
      </p>

      {isAdmin && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          <Link href="/alumni" className="border border-line rounded-sm p-4 hover:border-maroon">
            <p className="font-mono text-xs uppercase text-slate mb-1">Total Alumni</p>
            <p className="font-display text-2xl">{stats.totalAlumni}</p>
          </Link>
          <Link href="/blog" className="border border-line rounded-sm p-4 hover:border-maroon">
            <p className="font-mono text-xs uppercase text-slate mb-1">Cerita Tayang</p>
            <p className="font-display text-2xl">
              {stats.totalCeritaTayang}
              {pendingPosts && pendingPosts.length > 0 && (
                <span className="font-mono text-xs text-maroon ml-2">
                  +{pendingPosts.length} pending
                </span>
              )}
            </p>
          </Link>
          <Link href="/kas" className="border border-line rounded-sm p-4 hover:border-maroon">
            <p className="font-mono text-xs uppercase text-slate mb-1">Saldo Kas</p>
            <p className="font-display text-xl">
              {formatRupiah(stats.saldoKas)}
              {pendingKas && pendingKas.length > 0 && (
                <span className="font-mono text-xs text-maroon ml-2 block">
                  {pendingKas.length} menunggu verifikasi
                </span>
              )}
            </p>
          </Link>
          <Link href="/agenda" className="border border-line rounded-sm p-4 hover:border-maroon">
            <p className="font-mono text-xs uppercase text-slate mb-1">Acara Mendatang</p>
            <p className="font-display text-2xl">{stats.totalAcaraMendatang}</p>
          </Link>
          <Link href="/usaha" className="border border-line rounded-sm p-4 hover:border-maroon">
            <p className="font-mono text-xs uppercase text-slate mb-1">Usaha Terdaftar</p>
            <p className="font-display text-2xl">
              {stats.totalUsahaApproved}
              {pendingBusinesses && pendingBusinesses.length > 0 && (
                <span className="font-mono text-xs text-maroon ml-2">
                  +{pendingBusinesses.length} pending
                </span>
              )}
            </p>
          </Link>
        </div>
      )}

      <div className="flex gap-3 mb-10 flex-wrap">
        <Link
          href="/dashboard/new-post"
          className="bg-maroon text-paper px-4 py-2 rounded-sm text-sm hover:bg-maroon-dark"
        >
          + Tulis Cerita
        </Link>
        <Link
          href="/dashboard/new-album"
          className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper"
        >
          + Buat Album
        </Link>
        <Link
          href="/dashboard/kas/confirm"
          className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper"
        >
          + Konfirmasi Transfer Kas
        </Link>
        <Link
          href="/dashboard/usaha/new"
          className="border border-ink px-4 py-2 rounded-sm text-sm hover:bg-ink hover:text-paper"
        >
          + Daftarkan Usaha
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/dashboard/agenda/new"
              className="border border-maroon text-maroon px-4 py-2 rounded-sm text-sm hover:bg-maroon hover:text-paper"
            >
              + Buat Acara
            </Link>
            <Link
              href="/dashboard/kas/new-expense"
              className="border border-maroon text-maroon px-4 py-2 rounded-sm text-sm hover:bg-maroon hover:text-paper"
            >
              + Catat Pengeluaran Kas
            </Link>
            <Link
              href="/dashboard/kas/settings"
              className="border border-maroon text-maroon px-4 py-2 rounded-sm text-sm hover:bg-maroon hover:text-paper"
            >
              Atur Rekening Kas
            </Link>
            <a
              href="/api/alumni/export"
              className="border border-maroon text-maroon px-4 py-2 rounded-sm text-sm hover:bg-maroon hover:text-paper"
            >
              Export Data Alumni (Excel)
            </a>
          </>
        )}
      </div>

      {isAdmin && pendingPosts && pendingPosts.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">
            Menunggu Persetujuan ({pendingPosts.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pendingPosts.map((post: any) => (
              <div
                key={post.id}
                className="rule pt-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-body text-sm">{post.title}</p>
                  <p className="font-mono text-xs text-slate">
                    oleh {post.author?.full_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approvePost}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <button className="text-xs font-mono text-maroon underline">
                      Setujui
                    </button>
                  </form>
                  <form action={rejectPost}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <button className="text-xs font-mono text-slate underline">
                      Tolak
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAdmin && pendingKas && pendingKas.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">
            Konfirmasi Kas Menunggu ({pendingKas.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pendingKas.map((kas: any) => (
              <div
                key={kas.id}
                className="rule pt-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-body text-sm">
                    {kas.contributor?.full_name ?? "Alumni"} ·{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(Number(kas.amount))}
                  </p>
                  <p className="font-mono text-xs text-slate">
                    {new Date(kas.transaction_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {kas.description ? ` · ${kas.description}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={verifyKas}>
                    <input type="hidden" name="kas_id" value={kas.id} />
                    <button className="text-xs font-mono text-maroon underline">
                      Verifikasi
                    </button>
                  </form>
                  <form action={rejectKas}>
                    <input type="hidden" name="kas_id" value={kas.id} />
                    <button className="text-xs font-mono text-slate underline">
                      Tolak
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAdmin && pendingBusinesses && pendingBusinesses.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl mb-3">
            Usaha Menunggu Persetujuan ({pendingBusinesses.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pendingBusinesses.map((biz: any) => (
              <div key={biz.id} className="rule pt-3 flex items-center justify-between">
                <div>
                  <p className="font-body text-sm">{biz.name}</p>
                  <p className="font-mono text-xs text-slate">
                    {biz.category ? `${biz.category} · ` : ""}oleh {biz.owner?.full_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveBusiness}>
                    <input type="hidden" name="business_id" value={biz.id} />
                    <button className="text-xs font-mono text-maroon underline">
                      Setujui
                    </button>
                  </form>
                  <form action={rejectBusiness}>
                    <input type="hidden" name="business_id" value={biz.id} />
                    <button className="text-xs font-mono text-slate underline">
                      Tolak
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid sm:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl mb-3">Cerita Saya</h2>
          {!myPosts || myPosts.length === 0 ? (
            <p className="text-sm text-slate font-body">Belum ada cerita.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myPosts.map((post) => (
                <li key={post.id} className="text-sm flex items-center gap-2">
                  <span className="font-mono text-xs text-slate w-16">
                    {post.status === "published"
                      ? "Tayang"
                      : post.status === "pending"
                      ? "Ditinjau"
                      : "Ditolak"}
                  </span>
                  {post.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl mb-3">Album Saya</h2>
          {!myAlbums || myAlbums.length === 0 ? (
            <p className="text-sm text-slate font-body">Belum ada album.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myAlbums.map((album: any) => (
                <li key={album.id} className="text-sm flex items-center justify-between">
                  <span>
                    {album.title}{" "}
                    <span className="font-mono text-xs text-slate">
                      ({album.photos?.length ?? 0} foto)
                    </span>
                  </span>
                  <Link
                    href={`/dashboard/new-album/${album.id}/upload`}
                    className="font-mono text-xs text-maroon underline"
                  >
                    Tambah Foto
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

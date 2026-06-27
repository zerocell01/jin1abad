import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rsvpEvent, deleteEvent } from "../actions";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: event } = await supabase
    .from("events")
    .select("*, creator:profiles(full_name)")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("status, jumlah_orang, contributor:profiles(full_name)")
    .eq("event_id", params.id);

  const { data: myRsvp } = user
    ? await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", params.id)
        .eq("profile_id", user.id)
        .maybeSingle()
    : { data: null };

  const hadirList = rsvps?.filter((r: any) => r.status === "hadir") ?? [];
  const mungkinList = rsvps?.filter((r: any) => r.status === "mungkin") ?? [];
  const totalOrangHadir = hadirList.reduce(
    (sum: number, r: any) => sum + (r.jumlah_orang ?? 1),
    0
  );

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Agenda
      </p>
      <h1 className="font-display text-3xl mb-3">{event.title}</h1>

      <div className="font-mono text-sm text-slate mb-6 flex flex-col gap-1">
        <span>
          📅{" "}
          {new Date(event.event_date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {event.location && <span>📍 {event.location}</span>}
      </div>

      {event.cover_image_url && (
        <div className="relative w-full aspect-[16/9] mb-6 rounded-sm overflow-hidden">
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {event.description && (
        <p className="font-body text-base leading-relaxed whitespace-pre-wrap mb-8">
          {event.description}
        </p>
      )}

      {isAdmin && (
        <form action={deleteEvent} className="mb-8">
          <input type="hidden" name="event_id" value={event.id} />
          <button className="font-mono text-xs text-slate underline hover:text-maroon">
            Hapus acara ini
          </button>
        </form>
      )}

      <div className="rule pt-5 mb-8">
        <h2 className="font-display text-xl mb-3">Konfirmasi Kehadiran</h2>
        {user ? (
          <form action={rsvpEvent} className="flex flex-col gap-3 max-w-sm">
            <input type="hidden" name="event_id" value={event.id} />
            <div className="flex gap-2">
              {[
                { value: "hadir", label: "Hadir" },
                { value: "mungkin", label: "Mungkin" },
                { value: "tidak_hadir", label: "Tidak Hadir" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-1.5 font-body text-sm border border-line rounded-sm px-3 py-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    defaultChecked={myRsvp?.status === opt.value}
                    required
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">
                Jumlah orang (termasuk kamu)
              </label>
              <input
                type="number"
                name="jumlah_orang"
                min={1}
                defaultValue={myRsvp?.jumlah_orang ?? 1}
                className="w-24 border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase mb-1">
                Catatan (opsional)
              </label>
              <input
                name="note"
                defaultValue={myRsvp?.note ?? ""}
                placeholder="Bawa keluarga, dll"
                className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
              />
            </div>
            <button
              type="submit"
              className="bg-maroon text-paper px-4 py-2 rounded-sm mt-1 hover:bg-maroon-dark w-fit"
            >
              {myRsvp ? "Update Konfirmasi" : "Kirim Konfirmasi"}
            </button>
          </form>
        ) : (
          <p className="font-body text-sm text-slate">
            <a href="/login" className="text-maroon underline">
              Masuk
            </a>{" "}
            dulu untuk konfirmasi kehadiran.
          </p>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">
          Yang Konfirmasi Hadir ({totalOrangHadir} orang)
        </h2>
        {hadirList.length === 0 ? (
          <p className="text-sm text-slate font-body">Belum ada yang konfirmasi hadir.</p>
        ) : (
          <ul className="font-body text-sm flex flex-col gap-1 mb-4">
            {hadirList.map((r: any, i: number) => (
              <li key={i}>
                {r.contributor?.full_name ?? "Alumni"}
                {r.jumlah_orang > 1 ? ` (+${r.jumlah_orang - 1})` : ""}
              </li>
            ))}
          </ul>
        )}
        {mungkinList.length > 0 && (
          <>
            <p className="font-mono text-xs uppercase text-slate mb-1">Mungkin Hadir</p>
            <ul className="font-body text-sm text-slate flex flex-col gap-1">
              {mungkinList.map((r: any, i: number) => (
                <li key={i}>{r.contributor?.full_name ?? "Alumni"}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AgendaPage() {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  const { data: upcoming } = await supabase
    .from("events")
    .select("id, title, location, event_date, cover_image_url")
    .gte("event_date", nowIso)
    .order("event_date", { ascending: true });

  const { data: past } = await supabase
    .from("events")
    .select("id, title, location, event_date, cover_image_url")
    .lt("event_date", nowIso)
    .order("event_date", { ascending: false })
    .limit(10);

  const { data: rsvpCounts } = await supabase
    .from("event_rsvps")
    .select("event_id, status");

  function countFor(eventId: string, status: string) {
    return (
      rsvpCounts?.filter((r) => r.event_id === eventId && r.status === status)
        .length ?? 0
    );
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Agenda
      </p>
      <h1 className="font-display text-3xl mb-8">Acara Reuni</h1>

      <h2 className="font-display text-xl mb-4">Mendatang</h2>
      {!upcoming || upcoming.length === 0 ? (
        <p className="text-slate font-body mb-10">Belum ada acara yang dijadwalkan.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-10">
          {upcoming.map((event) => (
            <Link href={`/agenda/${event.id}`} key={event.id} className="rule pt-4 block group">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl group-hover:text-maroon">
                  {event.title}
                </h3>
                <span className="font-mono text-xs text-slate whitespace-nowrap">
                  {new Date(event.event_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {event.location && (
                <p className="font-body text-sm text-slate mt-1">{event.location}</p>
              )}
              <p className="font-mono text-xs text-maroon mt-2">
                {countFor(event.id, "hadir")} konfirmasi hadir ·{" "}
                {countFor(event.id, "mungkin")} mungkin hadir
              </p>
            </Link>
          ))}
        </div>
      )}

      {past && past.length > 0 && (
        <>
          <h2 className="font-display text-xl mb-4">Sudah Lewat</h2>
          <div className="flex flex-col gap-3">
            {past.map((event) => (
              <Link
                href={`/agenda/${event.id}`}
                key={event.id}
                className="rule pt-3 flex items-baseline justify-between text-slate hover:text-maroon"
              >
                <span className="font-body text-sm">{event.title}</span>
                <span className="font-mono text-xs whitespace-nowrap">
                  {new Date(event.event_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { format } from "date-fns";

export default async function EventPage({ params }:{params:{slug:string}}) {
  const supabase = supabaseAdmin();
  const { data: event } = await supabase.from("events").select("*").eq("slug", params.slug).single();
  if (!event) return <div>No encontrado</div>;
  const { data: tickets } = await supabase.from("ticket_types").select("*").eq("event_id", event.id).order("price_cents",{ascending:true});
  const { data: posts } = await supabase.from("event_posts").select("*").eq("event_id", event.id).order("created_at",{ascending:false}).limit(20);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="aspect-[16/6] bg-zinc-900">{event.cover_url ? <img src={event.cover_url} alt="" className="w-full h-full object-cover"/> : null}</div>
        <div className="p-6">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <div className="text-sm text-zinc-400 mt-2">{event.category} · {event.city}{event.venue ? ` · ${event.venue}`:""} · {event.starts_at ? format(new Date(event.starts_at),"dd/MM/yyyy HH:mm"):"—"}</div>
          {event.description ? <p className="text-zinc-300 mt-4 whitespace-pre-wrap">{event.description}</p> : null}
          {event.age_18 ? <div className="mt-3 text-xs text-zinc-500">+18</div> : null}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-6">
        <h2 className="font-semibold text-lg">Entradas</h2>
        <div className="mt-4 space-y-3">
          {(tickets ?? []).map((t:any)=> <TicketBuy key={t.id} eventId={event.id} t={t} />)}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-lg">Contenido</h2>
          <a className="no-underline text-sm hover:underline" href={`/dashboard/events/${event.id}/posts/new`}>+ Publicar</a>
        </div>
        <div className="space-y-4">
          {(posts ?? []).map((p:any)=>(
            <div key={p.id} className="rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-3 text-sm"><a className="no-underline hover:underline font-medium" href={`/u/${p.author_handle}`}>@{p.author_handle}</a><span className="text-zinc-500"> · {new Date(p.created_at).toLocaleString("es-ES")}</span></div>
              {p.media_url ? <div className="bg-zinc-900"><img src={p.media_url} alt="" className="w-full h-auto"/></div> : null}
              <div className="p-4">
                {p.caption ? <p className="whitespace-pre-wrap">{p.caption}</p> : null}
                <div className="mt-3 flex gap-4 text-sm text-zinc-300"><span>❤️ {p.likes_count}</span><span>💬 {p.comments_count}</span><span>🔖 {p.saves_count}</span></div>
              </div>
            </div>
          ))}
          {(!posts || posts.length===0) ? <p className="text-sm text-zinc-400">Aún no hay posts.</p> : null}
        </div>
      </section>
    </div>
  );
}

function TicketBuy({ eventId, t }:{eventId:string; t:any}) {
  // server component wrapper with client button
  return <BuyButton eventId={eventId} ticketType={t} />;
}

import BuyButton from './BuyButton';

export const dynamic = "force-dynamic";
import { supabasePublic } from "@/lib/supabase/public";
import { format } from "date-fns";

export default async function Home() {
  const supabase = supabasePublic();
  const { data: trending } = await supabase.from("events_trending").select("*").order("score",{ascending:false}).limit(8);
  const { data: feed } = await supabase.from("feed_items_view").select("*").order("created_at",{ascending:false}).limit(25);

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
        <h1 className="text-2xl font-semibold">Tu ciudad, tu tribu</h1>
        <p className="text-zinc-400 mt-2">Clubbing, ocio, gastronomía, cultura y más.</p>
        <div className="mt-4 flex gap-3">
          <a className="no-underline px-4 py-2 bg-zinc-100 text-zinc-950" href="/explore">Explorar</a>
          <a className="no-underline px-4 py-2 border border-zinc-700" href="/dashboard/events/new">Crear evento</a>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Trending</h2>
          <a className="no-underline text-sm hover:underline" href="/explore?sort=trending">Ver todo</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(trending ?? []).map((e:any)=>(
            <a key={e.event_id} href={`/e/${e.slug}`} className="no-underline">
              <div className="rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-600 transition">
                <div className="aspect-[16/10] bg-zinc-900">{e.cover_url ? <img src={e.cover_url} alt="" className="w-full h-full object-cover" /> : null}</div>
                <div className="p-4">
                  <div className="font-semibold line-clamp-1">{e.title}</div>
                  <div className="text-sm text-zinc-400 mt-1">{e.city} · {e.starts_at ? format(new Date(e.starts_at),"dd/MM HH:mm"):"—"}</div>
                  <div className="text-xs text-zinc-500 mt-2">Score {Number(e.score).toFixed(1)}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Feed</h2>
        <div className="space-y-4">
          {(feed ?? []).map((it:any)=>(
            <div key={it.id} className="rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm">
                  <a className="no-underline font-medium hover:underline" href={`/u/${it.author_handle}`}>@{it.author_handle}</a>
                  <span className="text-zinc-500"> · {new Date(it.created_at).toLocaleString("es-ES")}</span>
                </div>
                <a className="no-underline text-sm hover:underline" href={`/e/${it.event_slug}`}>Ver evento</a>
              </div>
              {it.media_url ? <div className="bg-zinc-900"><img src={it.media_url} alt="" className="w-full h-auto"/></div> : null}
              <div className="p-4">
                <div className="font-semibold">{it.event_title}</div>
                <div className="text-sm text-zinc-400">{it.city}</div>
                {it.caption ? <p className="mt-3 whitespace-pre-wrap">{it.caption}</p> : null}
                <div className="mt-4 flex gap-4 text-sm text-zinc-300">
                  <span>❤️ {it.likes_count}</span><span>💬 {it.comments_count}</span><span>🔖 {it.saves_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

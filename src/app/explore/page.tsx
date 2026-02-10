export const dynamic = "force-dynamic";
import { supabasePublic } from "@/lib/supabase/public";
import { format } from "date-fns";

export default async function Explore({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const supabase = supabasePublic();
  const city = searchParams.city || "";
  const category = searchParams.category || "";
  const q = searchParams.q || "";
  const freeOnly = searchParams.free === "1";
  const sort = searchParams.sort || "date";

  if (sort === "trending") {
    const { data } = await supabase.from("events_trending").select("*").limit(60);
    const events = (data ?? []).filter((e:any)=> (!city || (e.city||"").toLowerCase().includes(city.toLowerCase())) && (!category || e.category===category));
    return <Page events={events.map((e:any)=>({id:e.event_id, ...e}))} />;
  }

  let query = supabase.from("events").select("id,title,slug,city,category,starts_at,cover_url,is_free_event,price_min_cents").eq("status","published");
  if (city) query = query.ilike("city", `%${city}%`);
  if (category) query = query.eq("category", category);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (freeOnly) query = query.eq("is_free_event", true);

  const { data: events } = await query.order("starts_at",{ascending:true}).limit(60);
  return <Page events={events ?? []} />;
}

function Page({ events }:{events:any[]}) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Explorar</h1>
      <form className="rounded-xl border border-zinc-800 p-4 grid grid-cols-2 md:grid-cols-6 gap-3" action="/explore" method="get">
        <input name="q" placeholder="Buscar" />
        <input name="city" placeholder="Ciudad" />
        <select name="category" defaultValue="">
          <option value="">Categoría</option>
          <option value="clubbing">Clubbing</option><option value="ocio">Ocio</option><option value="gastronomia">Gastronomía</option>
          <option value="cultura">Cultura</option><option value="deporte">Deporte</option><option value="otros">Otros</option>
        </select>
        <select name="sort" defaultValue="date"><option value="date">Fecha</option><option value="trending">Trending</option></select>
        <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="free" value="1" className="accent-zinc-100"/>Gratis</label>
        <button className="px-4 py-2 bg-zinc-100 text-zinc-950">Filtrar</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e:any)=>(
          <a key={e.id} href={`/e/${e.slug}`} className="no-underline">
            <div className="rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-600 transition">
              <div className="aspect-[16/10] bg-zinc-900">{e.cover_url ? <img src={e.cover_url} alt="" className="w-full h-full object-cover"/> : null}</div>
              <div className="p-4">
                <div className="font-semibold line-clamp-1">{e.title}</div>
                <div className="text-sm text-zinc-400 mt-1">{e.city} · {e.starts_at ? format(new Date(e.starts_at),"dd/MM/yyyy HH:mm"):"—"}</div>
                <div className="text-xs text-zinc-500 mt-2">{e.category || "otros"} · {e.is_free_event ? "Gratis" : `Desde ${(e.price_min_cents/100).toFixed(2)}€`}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

import { getUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function EditEvent({ params }:{params:{id:string}}) {
  const uid = await getUserId();
  if (!uid) return <div>Necesitas login.</div>;
  const supabase = supabaseAdmin();
  const { data: event } = await supabase.from("events").select("*").eq("id", params.id).single();
  if (!event) return <div>No encontrado</div>;
  if (event.created_by !== uid) return <div>No autorizado</div>;
  const { data: tickets } = await supabase.from("ticket_types").select("*").eq("event_id", event.id).order("created_at",{ascending:true});
  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">Editar evento</h1>
      <form action="/api/events/update" method="post" className="space-y-3">
        <input type="hidden" name="id" value={event.id}/>
        <input name="title" defaultValue={event.title} required/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="city" defaultValue={event.city} required/>
          <input name="venue" defaultValue={event.venue ?? ""}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select name="category" defaultValue={event.category || "otros"}>
            <option value="clubbing">Clubbing</option><option value="ocio">Ocio</option><option value="gastronomia">Gastronomía</option>
            <option value="cultura">Cultura</option><option value="deporte">Deporte</option><option value="otros">Otros</option>
          </select>
          <input name="starts_at" type="datetime-local" defaultValue={(event.starts_at ?? "").slice(0,16)} required/>
        </div>
        <textarea name="description" defaultValue={event.description ?? ""} rows={6}/>
        <input name="cover_url" defaultValue={event.cover_url ?? ""}/>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="age_18" value="1" defaultChecked={!!event.age_18} className="accent-zinc-100"/> +18
        </label>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-zinc-100 text-zinc-950">Guardar</button>
          <button name="publish" value="1" className="px-4 py-2 border border-zinc-700">Publicar</button>
        </div>
      </form>

      <section className="rounded-xl border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Tickets</h2>
          <a className="no-underline text-sm hover:underline" href={`/dashboard/events/${event.id}/tickets/new`}>+ Añadir</a>
        </div>
        <div className="space-y-2">
          {(tickets ?? []).map((t:any)=>(
            <div key={t.id} className="flex items-center justify-between border border-zinc-800 rounded-lg p-3">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-zinc-400">{t.is_free ? "Gratis" : `${(t.price_cents/100).toFixed(2)}€`} · Stock {t.quantity} · Vendidas {t.total_sold}</div>
              </div>
              <form action="/api/tickets/delete" method="post">
                <input type="hidden" name="id" value={t.id}/>
                <button className="text-sm underline decoration-zinc-700">Eliminar</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Posts</h2>
          <a className="no-underline text-sm hover:underline" href={`/dashboard/events/${event.id}/posts/new`}>+ Crear post</a>
        </div>
      </section>
    </div>
  );
}

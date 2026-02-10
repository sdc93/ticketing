import { getUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function NewTicket({ params }:{params:{id:string}}) {
  const uid = await getUserId();
  if (!uid) return <div>Necesitas login.</div>;
  const supabase = supabaseAdmin();
  const { data: ev } = await supabase.from("events").select("id,created_by,title").eq("id", params.id).single();
  if (!ev) return <div>No encontrado</div>;
  if (ev.created_by !== uid) return <div>No autorizado</div>;
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo ticket</h1>
      <p className="text-zinc-400 text-sm">Evento: {ev.title}</p>
      <form action="/api/tickets" method="post" className="space-y-3">
        <input type="hidden" name="event_id" value={ev.id}/>
        <input name="name" placeholder="Nombre (GA, VIP...)" required/>
        <label className="block text-sm text-zinc-300"><input type="checkbox" name="is_free" value="1" className="mr-2"/> Ticket gratis (RSVP)</label>
        <input name="price_eur" placeholder="Precio EUR (ej: 15.00) — ignorado si gratis"/>
        <input name="quantity" type="number" min="1" defaultValue="100" required/>
        <button className="px-4 py-2 bg-zinc-100 text-zinc-950">Crear</button>
      </form>
    </div>
  );
}

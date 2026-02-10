import { getUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function NewPost({ params }:{params:{id:string}}) {
  const uid = await getUserId();
  if (!uid) return <div>Necesitas login.</div>;
  const supabase = supabaseAdmin();
  const { data: ev } = await supabase.from("events").select("id,created_by,title,slug").eq("id", params.id).single();
  if (!ev) return <div>No encontrado</div>;
  if (ev.created_by !== uid) return <div>No autorizado</div>;
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo post</h1>
      <p className="text-zinc-400 text-sm">Evento: {ev.title}</p>
      <form action="/api/posts" method="post" className="space-y-3">
        <input type="hidden" name="event_id" value={ev.id}/>
        <input name="media_url" placeholder="Media URL (imagen/video)"/>
        <textarea name="caption" placeholder="Texto" rows={5}/>
        <button className="px-4 py-2 bg-zinc-100 text-zinc-950">Publicar</button>
      </form>
    </div>
  );
}

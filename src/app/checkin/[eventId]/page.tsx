import { getUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import UI from "./ui";

export default async function Checkin({ params }:{params:{eventId:string}}) {
  const uid = await getUserId();
  if(!uid) return <div>Necesitas login.</div>;
  const supabase = supabaseAdmin();
  const { data: ev } = await supabase.from("events").select("id,title,created_by").eq("id", params.eventId).single();
  if(!ev) return <div>No encontrado</div>;
  if(ev.created_by !== uid) return <div>No autorizado</div>;
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Check-in: {ev.title}</h1><UI eventId={ev.id}/></div>;
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getUserId();
  if(!uid) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const supabase = supabaseAdmin();

  const f = await req.formData();
  const id = String(f.get("id")||"");
  const { data: tt } = await supabase.from("ticket_types").select("event_id").eq("id", id).single();
  if(!tt) return NextResponse.json({ error:"Not found" }, { status:404 });
  const { data: ev } = await supabase.from("events").select("created_by").eq("id", tt.event_id).single();
  if(!ev || ev.created_by !== uid) return NextResponse.json({ error:"Forbidden" }, { status:403 });

  const { error } = await supabase.from("ticket_types").delete().eq("id", id);
  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  await supabase.rpc("recompute_event_pricing",{ eid: tt.event_id });
  return NextResponse.redirect(new URL(`/dashboard/events/${tt.event_id}`, req.url));
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getUserId();
  if(!uid) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const supabase = supabaseAdmin();

  const f = await req.formData();
  const event_id = String(f.get("event_id")||"");
  const { data: ev } = await supabase.from("events").select("created_by").eq("id", event_id).single();
  if(!ev || ev.created_by !== uid) return NextResponse.json({ error:"Forbidden" }, { status:403 });

  const is_free = f.get("is_free") ? true : false;
  const price_eur = Number(String(f.get("price_eur")||"0"));
  const price_cents = is_free ? 0 : Math.max(0, Math.round(price_eur*100));

  const { error } = await supabase.from("ticket_types").insert({
    event_id,
    name: String(f.get("name")||""),
    is_free,
    price_cents,
    currency:"eur",
    quantity: Number(f.get("quantity")||0),
    total_sold: 0
  });
  if(error) return NextResponse.json({ error:error.message }, { status:400 });

  await supabase.rpc("recompute_event_pricing",{ eid: event_id });
  return NextResponse.redirect(new URL(`/dashboard/events/${event_id}`, req.url));
}

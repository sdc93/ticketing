import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getUserId();
  if(!uid) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const supabase = supabaseAdmin();

  const f = await req.formData();
  const id = String(f.get("id")||"");
  const publish = f.get("publish") ? true : false;

  const { data: ev } = await supabase.from("events").select("created_by").eq("id", id).single();
  if(!ev || ev.created_by !== uid) return NextResponse.json({ error:"Forbidden" }, { status:403 });

  const patch:any = {
    title: String(f.get("title")||""),
    city: String(f.get("city")||""),
    venue: String(f.get("venue")||"") || null,
    category: String(f.get("category")||"otros"),
    starts_at: new Date(String(f.get("starts_at")||"")).toISOString(),
    description: String(f.get("description")||"") || null,
    cover_url: String(f.get("cover_url")||"") || null,
    age_18: f.get("age_18") ? true : false
  };
  if(publish) patch.status = "published";

  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  return NextResponse.redirect(new URL(`/dashboard/events/${id}`, req.url));
}

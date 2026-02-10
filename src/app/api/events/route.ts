import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getUserId();
  if(!uid) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const supabase = supabaseAdmin();
  await supabase.rpc("ensure_profile",{ uid });

  const f = await req.formData();
  const title = String(f.get("title")||"");
  const slug = String(f.get("slug")||"");
  const city = String(f.get("city")||"");
  const venue = String(f.get("venue")||"");
  const category = String(f.get("category")||"otros");
  const starts_at = String(f.get("starts_at")||"");
  const description = String(f.get("description")||"");
  const cover_url = String(f.get("cover_url")||"");
  const age_18 = f.get("age_18") ? true : false;

  const { data, error } = await supabase.from("events").insert({
    title, slug, city, venue: venue||null, category,
    starts_at: new Date(starts_at).toISOString(),
    description: description||null,
    cover_url: cover_url||null,
    age_18,
    status:"draft",
    created_by: uid,
    is_free_event: true,
    price_min_cents: 0
  }).select("id").single();

  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  return NextResponse.redirect(new URL(`/dashboard/events/${data.id}`, req.url));
}

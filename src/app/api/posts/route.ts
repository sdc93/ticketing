import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getUserId();
  if(!uid) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const supabase = supabaseAdmin();
  await supabase.rpc("ensure_profile",{ uid });

  const f = await req.formData();
  const event_id = String(f.get("event_id")||"");
  const { data: ev } = await supabase.from("events").select("created_by,slug").eq("id", event_id).single();
  if(!ev || ev.created_by !== uid) return NextResponse.json({ error:"Forbidden" }, { status:403 });

  const { data: profile } = await supabase.from("profiles").select("handle").eq("id", uid).single();

  const { error } = await supabase.from("event_posts").insert({
    event_id,
    author_id: uid,
    author_handle: profile?.handle || "user",
    media_url: String(f.get("media_url")||"") || null,
    caption: String(f.get("caption")||"") || null
  });
  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  return NextResponse.redirect(new URL(`/e/${ev.slug}`, req.url));
}

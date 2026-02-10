import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login", url.origin));

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) return NextResponse.redirect(new URL("/login", url.origin));

  const res = NextResponse.redirect(new URL("/dashboard", url.origin));
  res.cookies.set("sb-access-token", data.session.access_token, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}

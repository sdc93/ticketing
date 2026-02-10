import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripeServerEnv } from "@/lib/env";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
const stripe = stripeServerEnv.success ? new Stripe(stripeServerEnv.data.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;

export async function POST(req: Request) {
  const uid = await getUserId();
  if(!uid) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if(!stripe || !stripeServerEnv.success) return NextResponse.json({ error:"Stripe not configured" }, { status:500 });

  const supabase = supabaseAdmin();
  await supabase.rpc("ensure_profile",{ uid });
  const { data: profile } = await supabase.from("profiles").select("stripe_account_id").eq("id", uid).single();

  let accountId = profile?.stripe_account_id as string | null;
  if(!accountId) {
    const account = await stripe.accounts.create({ type:"express", country:"ES", business_profile:{ product_description:"Organizador de eventos" } });
    accountId = account.id;
    await supabase.from("profiles").update({ stripe_account_id: accountId, is_organizer: true }).eq("id", uid);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: stripeServerEnv.data.STRIPE_CONNECT_REFRESH_URL || "http://localhost:3000/dashboard/connect/refresh",
    return_url: stripeServerEnv.data.STRIPE_CONNECT_RETURN_URL || "http://localhost:3000/dashboard/connect/return",
    type:"account_onboarding"
  });

  return NextResponse.redirect(link.url);
}

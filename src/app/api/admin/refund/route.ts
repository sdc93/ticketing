import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripeServerEnv } from "@/lib/env";

export const runtime = "nodejs";
const stripe = stripeServerEnv.success ? new Stripe(stripeServerEnv.data.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const form = await req.formData();
  const orderId = String(form.get("orderId") || "");
  const refundFee = String(form.get("refundFee") || "0") === "1";

  const supabase = supabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("id,status,refund_status,stripe_payment_intent")
    .eq("id", orderId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "paid" || order.refund_status !== "none") {
    return NextResponse.json({ error: "Order not refundable" }, { status: 409 });
  }
  if (!order.stripe_payment_intent) return NextResponse.json({ error: "Missing payment_intent" }, { status: 409 });

  // For destination charges:
  // - reverse_transfer=true pulls funds back from organizer
  // - refund_application_fee returns platform fee to buyer (optional)
  await stripe.refunds.create({
    payment_intent: order.stripe_payment_intent,
    reverse_transfer: true,
    refund_application_fee: refundFee
  } as any);

  await supabase.from("orders").update({
    refund_status: "refunded",
    refunded_at: new Date().toISOString(),
    fee_refunded: refundFee
  }).eq("id", orderId);

  return NextResponse.redirect(new URL("/admin", req.url));
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { clientEnv, stripeServerEnv } from "@/lib/env";
import { signTicketPayload } from "@/lib/qr";
import { feePerTicketCents } from "@/lib/fees";

export const runtime = "nodejs";
const stripe = stripeServerEnv.success ? new Stripe(stripeServerEnv.data.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;

export async function POST(req: Request) {
  const { eventId, ticketTypeId, quantity } = await req.json() as any;
  const supabase = supabaseAdmin();
  const { data: tt } = await supabase.from("ticket_types").select("*").eq("id", ticketTypeId).single();
  if(!tt || tt.event_id !== eventId) return NextResponse.json({ error:"Ticket inválido" }, { status:400 });

  const remaining = Math.max(0, tt.quantity - tt.total_sold);
  if(remaining < quantity) return NextResponse.json({ error:"No hay stock" }, { status:400 });

  const { data: order, error:oErr } = await supabase.from("orders").insert({
    event_id: eventId, ticket_type_id: ticketTypeId, quantity,
    base_amount_total_cents: tt.is_free ? 0 : tt.price_cents*quantity,
    platform_fee_total_cents: 0,
    amount_total_cents: tt.is_free ? 0 : tt.price_cents*quantity,
    currency: tt.currency, status: tt.is_free ? "paid":"pending"
  }).select("id").single();
  if(oErr || !order) return NextResponse.json({ error:oErr?.message || "Error" }, { status:400 });

  if(tt.is_free) {
    const tickets = Array.from({length: quantity}).map(()=> {
      const ticketId = crypto.randomUUID();
      const qr_token = signTicketPayload({ ticketId, eventId });
      return { id: ticketId, order_id: order.id, event_id: eventId, ticket_type_id: ticketTypeId, qr_token, status:"valid" };
    });
    await supabase.from("tickets").insert(tickets);
    await supabase.from("ticket_types").update({ total_sold: tt.total_sold + quantity }).eq("id", ticketTypeId);
    await supabase.rpc("recompute_event_pricing",{ eid: eventId });
    return NextResponse.json({ mode:"free", orderId: order.id });
  }

  if(!stripe) return NextResponse.json({ error:"Stripe no configurado" }, { status:500 });

  const session = await stripe.checkout.sessions.create({
    mode:"payment",
    success_url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/order/success?orderId=${order.id}`,
    cancel_url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/e/${encodeURIComponent(eventId)}`,
    line_items: [{ price_data: { currency: tt.currency, unit_amount: tt.price_cents, product_data:{ name: tt.name } }, quantity }],
    metadata: { orderId: order.id, eventId, ticketTypeId, quantity: String(quantity) }
  });

  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
  return NextResponse.json({ mode:"stripe", url: session.url });
}

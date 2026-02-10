import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { signTicketPayload } from "@/lib/qr";

export const runtime = "nodejs";
const stripe = serverEnv.success ? new Stripe(serverEnv.data.STRIPE_SECRET_KEY, { apiVersion:"2024-06-20" }) : null;

export async function POST(req: Request) {
  if(!stripe || !serverEnv.success) return NextResponse.json({ error:"Stripe not configured" }, { status:500 });
  const sig = req.headers.get("stripe-signature");
  if(!sig) return NextResponse.json({ error:"Missing signature" }, { status:400 });

  const body = await req.text();
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, sig, serverEnv.data.STRIPE_WEBHOOK_SECRET); }
  catch (err:any) { return NextResponse.json({ error:`Webhook Error: ${err.message}` }, { status:400 }); }

  if(event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const eventId = session.metadata?.eventId;
    const ticketTypeId = session.metadata?.ticketTypeId;
    const quantity = Number(session.metadata?.quantity || 1);

    if(orderId && eventId && ticketTypeId) {
      const supabase = supabaseAdmin();
      await supabase.from("orders").update({ status:"paid", stripe_payment_intent: String(session.payment_intent||"") }).eq("id", orderId);

      const tickets = Array.from({length: quantity}).map(()=> {
        const ticketId = crypto.randomUUID();
        const qr_token = signTicketPayload({ ticketId, eventId });
        return { id: ticketId, order_id: orderId, event_id: eventId, ticket_type_id: ticketTypeId, qr_token, status:"valid" };
      });
      await supabase.from("tickets").insert(tickets);

      const { data: tt } = await supabase.from("ticket_types").select("total_sold").eq("id", ticketTypeId).single();
      await supabase.from("ticket_types").update({ total_sold: (tt?.total_sold ?? 0) + quantity }).eq("id", ticketTypeId);
      await supabase.rpc("recompute_event_pricing",{ eid: eventId });
    }
  }

  return NextResponse.json({ received:true });
}

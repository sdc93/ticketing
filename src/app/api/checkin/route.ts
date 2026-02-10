import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyTicketPayload } from "@/lib/qr";

export async function POST(req: Request) {
  const { eventId, qrToken } = await req.json() as any;
  const payload = verifyTicketPayload(qrToken);
  if(!payload) return NextResponse.json({ ok:false, error:"QR inválido" }, { status:400 });
  if(payload.eventId !== eventId) return NextResponse.json({ ok:false, error:"QR no corresponde" }, { status:400 });

  const supabase = supabaseAdmin();
  const { data: ticket } = await supabase.from("tickets").select("id,status,event_id").eq("id", payload.ticketId).single();
  if(!ticket) return NextResponse.json({ ok:false, error:"Ticket no encontrado" }, { status:404 });
  if(ticket.event_id !== eventId) return NextResponse.json({ ok:false, error:"Ticket no corresponde" }, { status:400 });
  if(ticket.status !== "valid") return NextResponse.json({ ok:false, error:`Ticket ${ticket.status}` }, { status:400 });

  await supabase.from("tickets").update({ status:"used" }).eq("id", ticket.id);
  await supabase.from("checkins").insert({ ticket_id: ticket.id, event_id: eventId, checked_in_at: new Date().toISOString() });
  return NextResponse.json({ ok:true, ticketId: ticket.id, status:"used" });
}

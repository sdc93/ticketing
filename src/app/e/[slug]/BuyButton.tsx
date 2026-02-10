"use client";
import { useState } from "react";
import { feePerTicketCents } from "@/lib/fees";

export default function BuyButton({ eventId, ticketType }:{eventId:string; ticketType:any}) {
  const [loading,setLoading]=useState(false);
  const remaining = Math.max(0, (ticketType.quantity ?? 0) - (ticketType.total_sold ?? 0));
  const disabled = remaining<=0;
  const base = Number(ticketType.price_cents || 0);
  const fee = ticketType.is_free ? 0 : feePerTicketCents(base);
  const total = base + fee;
  const price = ticketType.is_free ? "Gratis" : `${(total/100).toFixed(2)}€`;

  async function buy() {
    setLoading(true);
    try{
      const res = await fetch("/api/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventId,ticketTypeId:ticketType.id,quantity:1})});
      const data = await res.json();
      if(!res.ok) throw new Error(data?.error || "Error");
      if(data.mode==="free") window.location.href = `/order/success?orderId=${encodeURIComponent(data.orderId)}`;
      else window.location.href = data.url;
    } finally { setLoading(false); }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 p-4">
      <div>
        <div className="font-medium">{ticketType.name}</div>
        <div className="text-sm text-zinc-400">
  {ticketType.is_free ? (
    <span>{price} · {remaining} restantes</span>
  ) : (
    <span>
      Entrada {(base/100).toFixed(2)}€ + Gastos {(fee/100).toFixed(2)}€ = <span className="text-zinc-200">{(total/100).toFixed(2)}€</span>
      {" · "}{remaining} restantes
    </span>
  )}
</div>
      </div>
      <button onClick={buy} disabled={disabled||loading} className="px-4 py-2 bg-zinc-100 text-zinc-950 disabled:opacity-50">
        {disabled ? "Agotado" : loading ? "Cargando…" : "Comprar"}
      </button>
    </div>
  );
}

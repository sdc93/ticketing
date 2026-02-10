import { supabasePublic } from "@/lib/supabase/public";
export default async function Success({ searchParams }:{searchParams:{orderId?:string}}) {
  const orderId = searchParams.orderId;
  if(!orderId) return <div>Falta orderId.</div>;
  const supabase = supabasePublic();
  const { data: tickets } = await supabase.from("tickets").select("id,qr_token").eq("order_id", orderId).limit(20);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Compra confirmada</h1>
      <p className="text-zinc-400">MVP: tokens QR (en producción se renderiza QR y se envía por email).</p>
      <div className="rounded-xl border border-zinc-800 p-4 space-y-2">
        {(tickets ?? []).map((t:any)=>(
          <div key={t.id} className="text-xs break-all">
            <div className="text-zinc-500">ticket {t.id}</div>
            <div>{t.qr_token}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

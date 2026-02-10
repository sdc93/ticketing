import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Admin() {
  await requireAdmin();
  const supabase = supabaseAdmin();

  const { data: revenue } = await supabase.from("admin_platform_revenue").select("*").single();
  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,refund_status,amount_total_cents,base_amount_total_cents,platform_fee_total_cents,currency,stripe_payment_intent,created_at,event_id")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <section className="rounded-xl border border-zinc-800 p-6 space-y-2">
        <h2 className="font-semibold">Revenue plataforma</h2>
        <div className="text-sm text-zinc-300">Fees cobrados: {(Number(revenue?.fee_paid_cents||0)/100).toFixed(2)}€</div>
        <div className="text-sm text-zinc-300">Fees reembolsados: {(Number(revenue?.fee_refunded_cents||0)/100).toFixed(2)}€</div>
        <div className="text-sm text-zinc-300">Base pagado (organizadores): {(Number(revenue?.base_paid_cents||0)/100).toFixed(2)}€</div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Órdenes (últimas 50)</h2>
          <a className="no-underline text-sm hover:underline" href="/admin/payouts">Payouts</a>
        </div>

        <div className="space-y-3">
          {(orders ?? []).map((o:any)=>(
            <div key={o.id} className="rounded-lg border border-zinc-800 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="text-zinc-500">#{o.id.slice(0,8)}</span>{" "}
                  <span className="ml-2">Total {(o.amount_total_cents/100).toFixed(2)} {String(o.currency).toUpperCase()}</span>{" "}
                  <span className="text-zinc-500 ml-2">({new Date(o.created_at).toLocaleString("es-ES")})</span>
                </div>
                <div className="text-xs text-zinc-400">
                  status: <span className="text-zinc-200">{o.status}</span> · refund: <span className="text-zinc-200">{o.refund_status}</span>
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                Base {(o.base_amount_total_cents/100).toFixed(2)}€ · Fee {(o.platform_fee_total_cents/100).toFixed(2)}€ · PI {o.stripe_payment_intent || "—"}
              </div>

              {o.status === "paid" && o.refund_status === "none" ? (
                <div className="flex gap-3">
                  <form action="/api/admin/refund" method="post">
                    <input type="hidden" name="orderId" value={o.id} />
                    <input type="hidden" name="refundFee" value="0" />
                    <button className="px-3 py-2 border border-zinc-700 text-sm">Reembolsar (sin fee)</button>
                  </form>
                  <form action="/api/admin/refund" method="post">
                    <input type="hidden" name="orderId" value={o.id} />
                    <input type="hidden" name="refundFee" value="1" />
                    <button className="px-3 py-2 bg-zinc-100 text-zinc-950 text-sm">Reembolsar (con fee)</button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Payouts() {
  await requireAdmin();
  const supabase = supabaseAdmin();

  const { data: rows } = await supabase
    .from("organizer_earnings_view")
    .select("organizer_id,organizer_handle,stripe_account_id,orders_paid,base_earnings_cents,platform_fee_cents")
    .order("base_earnings_cents", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Payouts (vista)</h1>
        <a className="no-underline text-sm hover:underline" href="/admin">← Admin</a>
      </div>

      <section className="rounded-xl border border-zinc-800 p-6 space-y-3">
        <p className="text-sm text-zinc-400">
          Vista de analítica. Los payouts reales se gestionan por Stripe Connect (destination charges).
        </p>
        <div className="space-y-3">
          {(rows ?? []).map((r:any)=>(
            <div key={r.organizer_id} className="rounded-lg border border-zinc-800 p-4">
              <div className="font-medium">@{r.organizer_handle || "organizer"}</div>
              <div className="text-xs text-zinc-500 break-all">Stripe: {r.stripe_account_id || "—"}</div>
              <div className="text-sm text-zinc-300 mt-2">
                Órdenes pagadas: {r.orders_paid} · Base: {(Number(r.base_earnings_cents||0)/100).toFixed(2)}€ · Fee plataforma: {(Number(r.platform_fee_cents||0)/100).toFixed(2)}€
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

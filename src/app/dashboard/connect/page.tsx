import { getUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Connect() {
  const uid = await getUserId();
  if (!uid) return <div>Necesitas login.</div>;
  const supabase = supabaseAdmin();
  const { data: profile } = await supabase.from("profiles").select("stripe_account_id").eq("id", uid).single();
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Stripe Connect</h1>
      <p className="text-zinc-400">Onboarding Express para payouts a organizadores.</p>
      <p className="text-sm">Cuenta: {profile?.stripe_account_id || "—"}</p>
      <form action="/api/connect/onboard" method="post">
        <button className="px-4 py-2 bg-zinc-100 text-zinc-950">Iniciar / Continuar</button>
      </form>
    </div>
  );
}

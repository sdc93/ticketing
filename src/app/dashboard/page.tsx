import { getUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Dashboard() {
  const uid = await getUserId();
  if (!uid) return <div className="rounded-xl border border-zinc-800 p-6">Necesitas <a href="/login">login</a>.</div>;
  const supabase = supabaseAdmin();
  await supabase.rpc("ensure_profile", { uid });
  const { data: profile } = await supabase.from("profiles").select("handle,is_organizer,stripe_account_id").eq("id", uid).single();
  const { data: events } = await supabase.from("events").select("id,title,status,slug").eq("created_by", uid).order("created_at",{ascending:false});
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 p-6">
        <h1 className="text-xl font-semibold">Dashboard @{profile?.handle}</h1>
        <div className="text-sm text-zinc-400 mt-2">Organizador: {profile?.is_organizer ? "sí":"no"} · Stripe: {profile?.stripe_account_id || "—"}</div>
        <div className="mt-4 flex gap-3">
          <a className="no-underline px-4 py-2 bg-zinc-100 text-zinc-950" href="/dashboard/events/new">+ Evento</a>
          <a className="no-underline px-4 py-2 border border-zinc-700" href="/dashboard/connect">Stripe Connect</a>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Tus eventos</h2>
        <div className="space-y-3">
          {(events ?? []).map((e:any)=>(
            <div key={e.id} className="rounded-xl border border-zinc-800 p-4 flex justify-between">
              <div><div className="font-medium">{e.title}</div><div className="text-sm text-zinc-400">Estado: {e.status}</div></div>
              <div className="flex gap-3 text-sm">
                <a className="no-underline hover:underline" href={`/e/${e.slug}`}>Ver</a>
                <a className="no-underline hover:underline" href={`/dashboard/events/${e.id}`}>Editar</a>
                <a className="no-underline hover:underline" href={`/checkin/${e.id}`}>Check-in</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

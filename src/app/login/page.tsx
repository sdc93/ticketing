"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);

  async function send() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) return alert(error.message);
    setSent(true);
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-zinc-400">Enlace mágico al email.</p>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="tu@email.com"/>
      <button className="px-4 py-2 bg-zinc-100 text-zinc-950" onClick={send} disabled={!email}>Enviar enlace</button>
      {sent ? <p className="text-sm text-zinc-400">Revisa tu bandeja de entrada.</p> : null}
    </div>
  );
}

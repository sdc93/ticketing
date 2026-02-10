"use client";
import { useState } from "react";
export default function UI({ eventId }:{eventId:string}) {
  const [token,setToken]=useState("");
  const [res,setRes]=useState<any>(null);
  async function verify(){
    const r = await fetch("/api/checkin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventId,qrToken:token})});
    setRes(await r.json());
  }
  return (
    <div className="rounded-xl border border-zinc-800 p-4 space-y-3 max-w-xl">
      <input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="QR token"/>
      <button className="px-4 py-2 bg-zinc-100 text-zinc-950" onClick={verify} disabled={!token}>Validar</button>
      {res ? <pre className="text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto">{JSON.stringify(res,null,2)}</pre> : null}
    </div>
  );
}

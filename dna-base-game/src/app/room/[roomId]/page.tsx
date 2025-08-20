"use client";

import { useEffect, useState } from "react";
import type { RoomStatus, Pairing, Student } from "@lib/types";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [pairs, setPairs] = useState<Pairing | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch(`/api/room/${roomId}/status`, { cache: "no-store" });
    const data = await res.json();
    setStatus(data);
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 1500); // lightweight polling
    return () => clearInterval(t);
  }, [roomId]);

  async function reset() {
    if (!confirm("Reset room and deck? This clears all draws.")) return;
    setBusy(true); setMsg("");
    const res = await fetch(`/api/room/${roomId}/reset`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) { setMsg(data.error || "Reset failed"); return; }
    setPairs(null);
    load();
    setMsg("Room reset");
  }

  async function computePairs() {
    const res = await fetch(`/api/room/${roomId}/pairs`, { cache: "no-store" });
    const data = await res.json();
    if (data.error) { setMsg(data.error); return; }
    setPairs(data);
  }

  const kpi = (label: string, value: number, hint?: string) => (
    <div className="card" style={{display:"grid", gap:8}}>
      <div style={{opacity:.7}}>{label}</div>
      <div className="kpi">{value}</div>
      {hint && <div style={{opacity:.65, fontSize:13}}>{hint}</div>}
    </div>
  );

  const countLeft = status?.countsLeft ?? {A:0,T:0,C:0,G:0};

  return (
    <div className="grid" style={{gap: 16}}>
      <div className="grid grid-3">
        {kpi("Cards left", status?.totalLeft ?? 0, "Remaining in deck")}
        {kpi("Players joined", status?.totalStudents ?? 0)}
        {kpi("Already drawn", status?.drawnCount ?? 0)}
      </div>

      <div className="card" style={{display:"flex", gap:12, alignItems:"center", flexWrap:"wrap"}}>
        <span className="badge"><span className="base">A</span> left {countLeft.A}</span>
        <span className="badge"><span className="base">T</span> left {countLeft.T}</span>
        <span className="badge"><span className="base">C</span> left {countLeft.C}</span>
        <span className="badge"><span className="base">G</span> left {countLeft.G}</span>
        <div style={{flex:1}} />
        <button onClick={computePairs}>Suggest pairs</button>
        <button onClick={reset} disabled={busy}>Reset room</button>
      </div>

      {msg && <div className="card" style={{borderColor:"#2b3e5c"}}>{msg}</div>}

      <div className="card">
        <h3>Players</h3>
        <div className="grid" style={{gap:12}}>
          {(status?.students ?? []).map((s: Student) => (
            <div key={s.id} className="card" style={{display:"grid", gap:6}}>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <div className="base">{s.base ?? "?"}</div>
                <div>
                  <div style={{fontWeight:800}}>{s.name}</div>
                  <div style={{opacity:.7, fontSize:12}}>{s.id}</div>
                </div>
              </div>
              {s.cardId && <div style={{opacity:.8, fontSize:13}}>Card: <code>{s.cardId}</code></div>}
            </div>
          ))}
        </div>
      </div>

      {pairs && (
        <div className="grid grid-2">
          <div className="card">
            <h3>A ↔ T Pairs</h3>
            {pairs.A_with_T.length === 0 && <p style={{opacity:.7}}>No A/T pairs yet.</p>}
            <div className="grid">
              {pairs.A_with_T.map(([a, t], i) => (
                <div key={i} className="card">
                  <div style={{display:"flex", gap:12, alignItems:"center"}}>
                    <span className="base">A</span> <b>{a.name}</b>
                    <span style={{opacity:.6}}>↔</span>
                    <span className="base">T</span> <b>{t.name}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>C ↔ G Pairs</h3>
            {pairs.C_with_G.length === 0 && <p style={{opacity:.7}}>No C/G pairs yet.</p>}
            <div className="grid">
              {pairs.C_with_G.map(([c, g], i) => (
                <div key={i} className="card">
                  <div style={{display:"flex", gap:12, alignItems:"center"}}>
                    <span className="base">C</span> <b>{c.name}</b>
                    <span style={{opacity:.6}}>↔</span>
                    <span className="base">G</span> <b>{g.name}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!!pairs.unpaired.length && (
            <div className="card" style={{gridColumn:"1 / -1"}}>
              <h3>Unpaired / Not Drawn</h3>
              <div className="grid">
                {pairs.unpaired.map(s => (
                  <div key={s.id} className="badge">
                    <span className="base">{s.base ?? "?"}</span>
                    <b>{s.name}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
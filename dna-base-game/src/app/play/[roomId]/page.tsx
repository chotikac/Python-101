"use client";

import { useEffect, useState } from "react";
import type { Student } from "@lib/types";

export default function PlayPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Load status of current student by calling join without a name—server will reuse cookie/id if present
    (async () => {
      const res = await fetch(`/api/room/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ name: "Player" })
      });
      const data = await res.json();
      if (data.ok) setStudent(data.student);
    })();
  }, [roomId]);

  async function draw() {
    setBusy(true); setError("");
    const res = await fetch(`/api/room/${roomId}/draw`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) { setError(data.error || "Draw failed"); return; }
    setStudent(data.student);
  }

  const already = !!student?.base;

  return (
    <div className="card">
      <h2>Room {roomId}</h2>
      <p>Your ID: <code>{student?.id ?? "…"}</code></p>

      {!already ? (
        <div className="grid">
          <button onClick={draw} disabled={busy}>Draw my DNA base</button>
          {error && <p style={{color:"var(--bad)",marginTop:8}}>{error}</p>}
        </div>
      ) : (
        <div style={{marginTop:16}}>
          <p>You drew:</p>
          <div className="base" aria-label={`Base ${student.base}`}>{student.base}</div>
          <p style={{opacity:.8, marginTop:8}}>Card: <code>{student.cardId}</code></p>
          <p style={{marginTop:12}}>Find your match: <b>{student.base === "A" ? "T" : student.base === "T" ? "A" : student.base === "C" ? "G" : "C"}</b></p>
        </div>
      )}
    </div>
  );
}
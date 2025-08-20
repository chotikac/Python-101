"use client";

import { useState } from "react";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function createRoom() {
    setBusy(true); setMsg("");
    const res = await fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ roomId: roomId || undefined })
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) { setMsg(data.error || "Create failed"); return; }
    setMsg(`Room ${data.roomId} created`);
  }

  async function joinAndGo() {
    if (!roomId) { setMsg("Enter a room ID"); return; }
    if (!name) { setMsg("Enter your name"); return; }
    setBusy(true); setMsg("");
    const res = await fetch(`/api/room/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) { setMsg(data.error || "Join failed"); return; }
    window.location.href = `/play/${roomId}`;
  }

  return (
    <div className="grid" style={{gap: 24}}>
      <div className="card">
        <h2>Create Room</h2>
        <p>Leave blank to use today’s date (e.g., <code>20250820</code>).</p>
        <div className="grid">
          <input placeholder="Room ID (optional)" value={roomId} onChange={e=>setRoomId(e.target.value)} />
          <button onClick={createRoom} disabled={busy}>Create</button>
        </div>
      </div>

      <div className="card">
        <h2>Join & Play</h2>
        <div className="grid">
          <input placeholder="Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} />
          <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
          <div style={{display:"flex", gap:12}}>
            <button onClick={joinAndGo} disabled={busy}>Join Room</button>
            {roomId && <a className="badge" href={`/room/${roomId}`}>Teacher View</a>}
          </div>
        </div>
      </div>

      {msg && <div className="card" style={{borderColor:"#2b3e5c"}}>{msg}</div>}
    </div>
  );
}
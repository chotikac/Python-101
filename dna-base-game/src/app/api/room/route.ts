import { NextResponse } from "next/server";
import { createRoom } from "@utils/game";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const roomId = (body?.roomId ?? "").trim() || new Date().toISOString().slice(0,10).replaceAll("-",""); // e.g., 20250820
    await createRoom(roomId, body?.counts);
    return NextResponse.json({ ok: true, roomId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
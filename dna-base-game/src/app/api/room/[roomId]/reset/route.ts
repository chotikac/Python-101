import { NextResponse } from "next/server";
import { resetRoom } from "@utils/game";

export async function POST(_: Request, { params }: { params: { roomId: string } }) {
  try {
    await resetRoom(params.roomId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
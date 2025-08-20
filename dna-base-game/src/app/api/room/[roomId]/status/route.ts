import { NextResponse } from "next/server";
import { getStatus } from "@utils/game";

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  try {
    const status = await getStatus(params.roomId);
    return NextResponse.json(status);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
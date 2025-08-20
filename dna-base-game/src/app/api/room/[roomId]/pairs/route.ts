import { NextResponse } from "next/server";
import { suggestPairs } from "@utils/game";

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  try {
    const pairs = await suggestPairs(params.roomId);
    return NextResponse.json(pairs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
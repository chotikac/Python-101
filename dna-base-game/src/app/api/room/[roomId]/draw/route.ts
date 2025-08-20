import { NextResponse } from "next/server";
import { drawCardOnce } from "@utils/game";

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const cookieName = `dna_sid_${params.roomId}`;
    const cookieHeader = request.headers.get("cookie") ?? "";
    const studentId = cookieHeader
      .split(";")
      .map(s => s.trim())
      .find(s => s.startsWith(`${cookieName}=`))
      ?.split("=")[1];

    if (!studentId) {
      return NextResponse.json({ ok: false, error: "No student cookie. Join the room first." }, { status: 401 });
    }

    const student = await drawCardOnce(params.roomId, studentId);
    return NextResponse.json({ ok: true, student });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
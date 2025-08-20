import { NextResponse } from "next/server";
import { joinRoom } from "@utils/game";

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const body = await request.json();
    const name = `${(body?.name ?? "").trim()}` || "Anonymous";
    const cookieName = `dna_sid_${params.roomId}`;

    const cookieHeader = request.headers.get("cookie") ?? "";
    const existingId = cookieHeader
      .split(";")
      .map(s => s.trim())
      .find(s => s.startsWith(`${cookieName}=`))
      ?.split("=")[1];

    const student = await joinRoom(params.roomId, name, existingId);

    const res = NextResponse.json({ ok: true, student });

    // Refresh/set cookie (non-HttpOnly so client can show ID if needed; secure in prod)
    res.cookies.set(cookieName, student.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 days
      sameSite: "lax"
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
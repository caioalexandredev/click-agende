import { NextResponse, type NextRequest } from "next/server";

import { readSessionFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await readSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  return NextResponse.json(session);
}


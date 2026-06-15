import { NextResponse, type NextRequest } from "next/server";

import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "Dados de cadastro inválidos." }, { status: 400 });
  }

  const springResponse = await springFetch("/register/cliente", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível criar a conta de cliente.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload, { status: 201 });
}


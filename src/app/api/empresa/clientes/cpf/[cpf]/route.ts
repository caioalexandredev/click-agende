import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cpf: string }> },
) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { cpf } = await params;
  const springResponse = await springFetch(`/cliente/cpf/${encodeURIComponent(cpf)}`, { headers });

  if (springResponse.status === 404) {
    return NextResponse.json(null, { status: 404 });
  }

  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível buscar o cliente.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

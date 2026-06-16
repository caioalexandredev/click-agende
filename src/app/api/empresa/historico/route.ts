import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function GET(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const source = new URL(request.url);
  const target = new URL("/agenda/painel-gestor", "http://spring.local");

  for (const key of ["dataInicio", "dataFim", "status", "profissionalId", "page", "size"]) {
    const value = source.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }

  const springResponse = await springFetch(`${target.pathname}${target.search}`, { headers });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível carregar o histórico.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

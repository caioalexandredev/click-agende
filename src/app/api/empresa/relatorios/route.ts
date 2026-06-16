import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function buildSpringPath(request: NextRequest) {
  const params = new URLSearchParams();
  const dataInicio = request.nextUrl.searchParams.get("dataInicio");
  const dataFim = request.nextUrl.searchParams.get("dataFim");
  const profissionalId = request.nextUrl.searchParams.get("profissionalId");

  if (dataInicio) params.set("dataInicio", dataInicio);
  if (dataFim) params.set("dataFim", dataFim);
  if (profissionalId) params.set("profissionalId", profissionalId);

  const query = params.toString();
  return query ? `/relatorio?${query}` : "/relatorio";
}

export async function GET(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const springResponse = await springFetch(buildSpringPath(request), { headers });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível carregar o relatório.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

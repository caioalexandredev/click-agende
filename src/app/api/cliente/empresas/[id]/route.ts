import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const springResponse = await springFetch(`/empresa/disponiveis/${id}`, { headers });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível carregar o estabelecimento.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

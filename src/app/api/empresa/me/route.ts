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
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const springResponse = await springFetch("/empresa/me", { headers });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Nao foi possivel carregar os dados da empresa.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

export async function PUT(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const springResponse = await springFetch("/empresa/me/editar", {
    method: "PUT",
    headers,
    body: JSON.stringify(await request.json().catch(() => null)),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Nao foi possivel atualizar os dados da empresa.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, getSpringApiUrl, parseSpringResponse } from "@/lib/server/spring";

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function POST(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ message: "Envie uma imagem válida." }, { status: 400 });
  }

  const springResponse = await fetch(`${getSpringApiUrl()}/empresa/me/foto-capa`, {
    method: "POST",
    headers,
    body: formData,
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível atualizar a foto de capa.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

export async function DELETE(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const springResponse = await fetch(`${getSpringApiUrl()}/empresa/me/foto-capa`, {
    method: "DELETE",
    headers,
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível remover a foto de capa.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

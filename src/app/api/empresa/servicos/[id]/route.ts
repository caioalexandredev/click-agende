import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

type ServicePayload = {
  name?: string;
  description?: string;
  price?: number;
  durationMin?: number;
  status?: "active" | "inactive";
  imageUrl?: string;
};

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function toSpringPayload(payload: ServicePayload) {
  return {
    nome: payload.name,
    descricao: payload.description,
    preco: payload.price,
    duracao: payload.durationMin,
    urlImagem: payload.imageUrl || null,
    disponivel: payload.status ? payload.status === "active" : undefined,
  };
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const springResponse = await springFetch(`/servico/editar/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(toSpringPayload(await request.json().catch(() => ({})))),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Nao foi possivel atualizar o servico.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const springResponse = await springFetch(`/servico/apagar/${id}`, {
    method: "DELETE",
    headers,
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Nao foi possivel excluir o servico.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

type ProfessionalPayload = {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
  workStart?: string;
  workEnd?: string;
  serviceIds?: string[];
  status?: "active" | "inactive";
  bio?: string;
};

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function toSpringPayload(payload: ProfessionalPayload) {
  return {
    nomeCompleto: payload.name,
    especialidade: payload.role,
    telefone: payload.phone,
    email: payload.email,
    urlImagem: payload.profileImageUrl || null,
    biografia: payload.bio || null,
    horarioInicio: payload.workStart,
    horarioFim: payload.workEnd,
    disponivel: payload.status ? payload.status === "active" : undefined,
    idsServicos: payload.serviceIds?.map(Number) ?? [],
  };
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const springResponse = await springFetch(`/funcionario/editar/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(toSpringPayload(await request.json().catch(() => ({})))),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível atualizar o profissional.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const springResponse = await springFetch(`/funcionario/apagar/${id}`, {
    method: "DELETE",
    headers,
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível excluir o profissional.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

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

export async function GET(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const springResponse = await springFetch("/servico/gerenciar", { headers });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível carregar os serviços.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const springResponse = await springFetch("/servico/inserir", {
    method: "POST",
    headers,
    body: JSON.stringify(toSpringPayload(await request.json().catch(() => ({})))),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível cadastrar o serviço.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload, { status: springResponse.status });
}

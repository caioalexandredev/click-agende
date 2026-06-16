import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const reviewSchema = z.object({
  nota: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional().nullable(),
});

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados da avaliação inválidos." }, { status: 400 });
  }

  const { id } = await context.params;
  const springResponse = await springFetch(`/agenda/${id}/avaliar`, {
    method: "POST",
    headers,
    body: JSON.stringify(parsed.data),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível enviar a avaliação.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

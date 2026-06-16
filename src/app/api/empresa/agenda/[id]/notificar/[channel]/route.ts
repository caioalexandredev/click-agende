import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getErrorMessage, parseSpringResponse, springFetch } from "@/lib/server/spring";

function getAuthorizationHeader(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; channel: string }> },
) {
  const headers = getAuthorizationHeader(request);

  if (!headers) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id, channel } = await context.params;
  const normalizedChannel = channel.toLowerCase();

  if (!["whatsapp", "email"].includes(normalizedChannel)) {
    return NextResponse.json({ message: "Canal de notificação inválido." }, { status: 400 });
  }

  const springResponse = await springFetch(`/agenda/${id}/notificar-cliente/${normalizedChannel}`, {
    method: "POST",
    headers,
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Não foi possível notificar o cliente.") },
      { status: springResponse.status },
    );
  }

  return NextResponse.json(payload);
}

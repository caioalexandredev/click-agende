import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { AUTH_ROLES, getDefaultPathForRoles, type AuthRole } from "@/lib/auth/routes";
import { readSessionFromToken, setAuthCookies } from "@/lib/auth/session";
import { getErrorMessage, getRefreshTokenFromSetCookie, parseSpringResponse, springFetch } from "@/lib/server/spring";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  expectedRole: z.enum([AUTH_ROLES.ADMIN, AUTH_ROLES.CLIENT]).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Dados de login inválidos." }, { status: 400 });
  }

  const springResponse = await springFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: parsed.data.email,
      senha: parsed.data.password,
    }),
  });
  const payload = await parseSpringResponse(springResponse);

  if (!springResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(payload, "Email ou senha inválidos.") },
      { status: springResponse.status },
    );
  }

  const accessToken = payload?.accessToken;
  if (typeof accessToken !== "string") {
    return NextResponse.json({ message: "Resposta de autenticação inválida." }, { status: 502 });
  }

  const session = await readSessionFromToken(accessToken);
  if (!session) {
    return NextResponse.json({ message: "Token de autenticação inválido." }, { status: 502 });
  }

  if (parsed.data.expectedRole && !session.roles.includes(parsed.data.expectedRole as AuthRole)) {
    return NextResponse.json({ message: "Seu perfil não tem permissão para esta área." }, { status: 403 });
  }

  const response = NextResponse.json({
    email: session.email,
    roles: session.roles,
    redirectTo: getDefaultPathForRoles(session.roles),
  });
  setAuthCookies(response, accessToken, getRefreshTokenFromSetCookie(springResponse.headers.get("set-cookie")));

  return response;
}


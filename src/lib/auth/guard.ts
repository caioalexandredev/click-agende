import { NextResponse, type NextRequest } from "next/server";

import { getDefaultPathForRoles, getRouteAccess, hasAnyRole, isPublicRoute } from "./routes";
import { readSessionFromRequest } from "./session";

const authPages = ["/cliente/login", "/cliente/cadastro", "/empresa/login", "/empresa/cadastro"];

export async function authGuard(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await readSessionFromRequest(request);

  if (session && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL(getDefaultPathForRoles(session.roles), request.url));
  }

  if (isPublicRoute(pathname)) return NextResponse.next();

  const access = getRouteAccess(pathname);
  if (!access) return NextResponse.next();

  if (!session) {
    const loginPath = pathname.startsWith("/empresa") ? "/empresa/login" : "/cliente/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (!hasAnyRole(session.roles, access.roles)) {
    return NextResponse.redirect(new URL(getDefaultPathForRoles(session.roles), request.url));
  }

  return NextResponse.next();
}


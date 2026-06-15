import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDefaultPathForRoles, hasAnyRole, type AuthRole } from "./routes";
import { ACCESS_TOKEN_COOKIE, readSessionFromToken } from "./session";

export async function getServerSession() {
  const cookieStore = await cookies();
  return readSessionFromToken(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
}

export async function requireAuth(roles: AuthRole[], loginPath: string) {
  const session = await getServerSession();

  if (!session) redirect(loginPath);
  if (!hasAnyRole(session.roles, roles)) redirect(getDefaultPathForRoles(session.roles));

  return session;
}

export async function requireGuest() {
  const session = await getServerSession();

  if (session) redirect(getDefaultPathForRoles(session.roles));
}

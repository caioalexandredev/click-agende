export const AUTH_ROLES = {
  ADMIN: "ROLE_ADMINISTRADOR",
  EMPLOYEE: "ROLE_FUNCIONARIO",
  CLIENT: "ROLE_CLIENTE",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

export type RouteAccess = {
  path: string;
  roles: AuthRole[];
};

export const publicRoutes = [
  "/",
  "/cliente/login",
  "/cliente/cadastro",
  "/empresa/login",
  "/empresa/cadastro",
] as const;

export const authRoutes = [
  { path: "/cliente", roles: [AUTH_ROLES.CLIENT] },
  { path: "/cliente/agendamentos", roles: [AUTH_ROLES.CLIENT] },
  { path: "/cliente/estabelecimento", roles: [AUTH_ROLES.CLIENT] },
  { path: "/empresa", roles: [AUTH_ROLES.ADMIN, AUTH_ROLES.EMPLOYEE] },
  { path: "/empresa/dados", roles: [AUTH_ROLES.ADMIN] },
  { path: "/empresa/profissionais", roles: [AUTH_ROLES.ADMIN] },
  { path: "/empresa/servicos", roles: [AUTH_ROLES.ADMIN] },
  { path: "/empresa/historico", roles: [AUTH_ROLES.ADMIN] },
  { path: "/empresa/relatorios", roles: [AUTH_ROLES.ADMIN] },
] satisfies RouteAccess[];

export function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route);
}

export function getRouteAccess(pathname: string) {
  return authRoutes
    .filter((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

export function getDefaultPathForRoles(roles: string[]) {
  if (roles.includes(AUTH_ROLES.ADMIN) || roles.includes(AUTH_ROLES.EMPLOYEE)) return "/empresa";
  if (roles.includes(AUTH_ROLES.CLIENT)) return "/cliente";
  return "/";
}

export function hasAnyRole(userRoles: string[], allowedRoles: readonly AuthRole[]) {
  return allowedRoles.some((role) => userRoles.includes(role));
}

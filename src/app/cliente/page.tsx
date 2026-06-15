import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import ClientHomeContent from "./ClientHomeContent";

export default async function ClientHomePage() {
  await requireAuth([AUTH_ROLES.CLIENT], "/cliente/login");

  return <ClientHomeContent />;
}


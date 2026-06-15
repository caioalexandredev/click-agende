import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import ServicosContent from "./ServicosContent";

export default async function ServicosPage() {
  await requireAuth([AUTH_ROLES.ADMIN], "/empresa/login");

  return <ServicosContent />;
}


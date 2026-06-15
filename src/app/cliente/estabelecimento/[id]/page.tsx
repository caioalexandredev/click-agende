import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import EstablishmentContent from "./EstablishmentContent";

export default async function EstablishmentPage() {
  await requireAuth([AUTH_ROLES.CLIENT], "/cliente/login");

  return <EstablishmentContent />;
}


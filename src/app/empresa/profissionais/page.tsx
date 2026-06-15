import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import ProfissionaisContent from "./ProfissionaisContent";

export default async function ProfissionaisPage() {
  await requireAuth([AUTH_ROLES.ADMIN], "/empresa/login");

  return <ProfissionaisContent />;
}


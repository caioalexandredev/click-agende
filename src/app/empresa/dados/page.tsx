import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import DadosEmpresaContent from "./DadosEmpresaContent";

export default async function DadosEmpresaPage() {
  await requireAuth([AUTH_ROLES.ADMIN], "/empresa/login");

  return <DadosEmpresaContent />;
}


import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";

import HistoricoContent from "./HistoricoContent";

export default async function HistoricoPage() {
  await requireAuth([AUTH_ROLES.ADMIN], "/empresa/login");

  return <HistoricoContent />;
}

import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";

import RelatoriosContent from "./RelatoriosContent";

export default async function RelatoriosPage() {
  await requireAuth([AUTH_ROLES.ADMIN], "/empresa/login");

  return <RelatoriosContent />;
}

import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";

import ClientSettingsContent from "./ClientSettingsContent";

export default async function ClientSettingsPage() {
  await requireAuth([AUTH_ROLES.CLIENT], "/cliente/login");

  return <ClientSettingsContent />;
}

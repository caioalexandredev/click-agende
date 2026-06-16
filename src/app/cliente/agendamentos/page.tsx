import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";

import ClientAppointmentsContent from "./ClientAppointmentsContent";

export default async function ClientAppointmentsPage() {
  await requireAuth([AUTH_ROLES.CLIENT], "/cliente/login");

  return <ClientAppointmentsContent />;
}

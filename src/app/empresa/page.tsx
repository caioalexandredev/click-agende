import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import CompanyDashboardContent from "./CompanyDashboardContent";

export default async function CompanyDashboardPage() {
  await requireAuth([AUTH_ROLES.ADMIN, AUTH_ROLES.EMPLOYEE], "/empresa/login");

  return <CompanyDashboardContent />;
}


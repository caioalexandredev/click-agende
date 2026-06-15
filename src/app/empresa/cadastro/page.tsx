import { requireGuest } from "@/lib/auth/server";

import CompanySignupContent from "./CompanySignupContent";

export default async function CompanySignupPage() {
  await requireGuest();

  return <CompanySignupContent />;
}

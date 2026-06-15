import { requireGuest } from "@/lib/auth/server";

import CompanyLoginContent from "./CompanyLoginContent";

export default async function CompanyLoginPage() {
  await requireGuest();

  return <CompanyLoginContent />;
}

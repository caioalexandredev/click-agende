import { requireGuest } from "@/lib/auth/server";

import ClientSignupContent from "./ClientSignupContent";

export default async function ClientSignupPage() {
  await requireGuest();

  return <ClientSignupContent />;
}

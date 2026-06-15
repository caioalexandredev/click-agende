import { requireGuest } from "@/lib/auth/server";

import ClientLoginContent from "./ClientLoginContent";

export default async function ClientLoginPage() {
  await requireGuest();

  return <ClientLoginContent />;
}

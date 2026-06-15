import { AUTH_ROLES } from "@/lib/auth/routes";
import { requireAuth } from "@/lib/auth/server";
import EstablishmentContent from "./EstablishmentContent";

type EstablishmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EstablishmentPage({ params }: EstablishmentPageProps) {
  await requireAuth([AUTH_ROLES.CLIENT], "/cliente/login");
  const { id } = await params;

  return <EstablishmentContent companyId={id} />;
}


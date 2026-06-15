"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { FormInput } from "@/components/form/FormInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

type Company = {
  id: string;
  businessName: string;
  description: string;
  address: string;
  city: string;
  uf: string;
  phone: string;
  email: string;
  coverImageUrl: string;
};

const MOCK_CLIENT = {
  name: "Caio Ramos",
};

const MOCK_COMPANIES: Company[] = [
  {
    id: "clickagende-studio",
    businessName: "ClickAgende Studio",
    description: "Estúdio especializado em beleza, bem-estar e atendimento com hora marcada.",
    address: "Rua das Flores, 120",
    city: "Palmas",
    uf: "TO",
    phone: "(63) 3456-7890",
    email: "contato@clickagende.com",
    coverImageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "barbearia-central",
    businessName: "Barbearia Central",
    description: "Cortes masculinos, barba completa e acabamento com atendimento pontual.",
    address: "Avenida JK, 845",
    city: "Palmas",
    uf: "TO",
    phone: "(63) 99988-1020",
    email: "agenda@barbeariacentral.com",
    coverImageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "espaco-bem-estar",
    businessName: "Espaço Bem-Estar",
    description: "Serviços de manicure, estética e cuidados pessoais em ambiente acolhedor.",
    address: "Quadra 104 Norte, Alameda 12",
    city: "Palmas",
    uf: "TO",
    phone: "(63) 99777-4500",
    email: "contato@espacobemestar.com",
    coverImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function ClientHomeContent() {
  const router = useRouter();
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [loading] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return companies;

    return companies.filter((company) =>
      [company.businessName, company.description, company.city, company.uf]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [companies, query]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/cliente/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-primary grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-lg">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold">ClickAgende</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" onClick={signOut} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-12">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Olá, {MOCK_CLIENT.name || "cliente"}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Escolha um Estabelecimento
          </h1>
          <p className="mt-1 text-muted-foreground">
            Selecione onde deseja agendar seus serviços.
          </p>
          <FormInput
            id="company-search"
            label="Buscar estabelecimento"
            wrapperClassName="mt-5"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, descrição ou cidade..."
            icon={<Search className="h-4 w-4" />}
          />
        </section>

        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="glass mt-6 grid place-items-center rounded-3xl p-12 text-center text-muted-foreground">
            <Store className="mb-3 h-10 w-10" />
            Nenhum estabelecimento encontrado.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const [imageError, setImageError] = useState(false);
  const href = `/cliente/estabelecimento?empresa=${company.id}`;

  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/30 to-accent/30">
        {company.coverImageUrl && !imageError ? (
          <div
            role="img"
            aria-label={company.businessName}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${company.coverImageUrl})` }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary-foreground/70">
            <Store className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="p-5">
        <Link href={href} className="font-display text-lg font-bold hover:text-primary">
          {company.businessName}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{company.description}</p>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {company.address}, {company.city} - {company.uf}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {company.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {company.email}
          </p>
        </div>

        <Link
          href={href}
          className="bg-gradient-primary mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow"
        >
          Agendar aqui
        </Link>
      </div>
    </article>
  );
}

"use client";

import {
  AlertCircle,
  CalendarCheck,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FormInput } from "@/components/form/FormInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

type ClientResponse = {
  id: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
};

type AddressResponse = {
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  uf?: string | null;
};

type ServiceResponse = {
  id: number;
  urlImagem?: string | null;
  nome: string;
  disponivel?: boolean | null;
};

type CompanyResponse = {
  id: string;
  nome: string;
  descricao?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: AddressResponse | null;
  servicos?: ServiceResponse[] | null;
};

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
  servicesCount: number;
};

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string") return message;
  }

  return fallback;
}

function mapCompany(company: CompanyResponse): Company {
  const availableServices = company.servicos?.filter((service) => service.disponivel !== false) ?? [];
  const coverImageUrl = availableServices.find((service) => service.urlImagem)?.urlImagem ?? "";

  return {
    id: company.id,
    businessName: company.nome,
    description: company.descricao || "Estabelecimento disponível para agendamentos.",
    address: company.endereco?.endereco || "Endereço não informado",
    city: company.endereco?.cidade || "",
    uf: company.endereco?.uf || "",
    phone: company.telefone || "Telefone não informado",
    email: company.email || "Email não informado",
    coverImageUrl,
    servicesCount: availableServices.length,
  };
}

export default function ClientHomeContent() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadClientHome() {
      setLoading(true);
      setError("");

      try {
        const [clientResponse, companiesResponse] = await Promise.all([
          fetch("/api/cliente/me"),
          fetch("/api/cliente/empresas"),
        ]);

        const clientPayload = (await clientResponse.json().catch(() => null)) as
          | ClientResponse
          | { message?: string }
          | null;
        const companiesPayload = (await companiesResponse.json().catch(() => null)) as
          | CompanyResponse[]
          | { message?: string }
          | null;

        if (clientResponse.status === 401 || companiesResponse.status === 401) {
          router.push("/cliente/login");
          return;
        }

        if (!clientResponse.ok) {
          throw new Error(getMessage(clientPayload, "Não foi possível carregar os dados do cliente."));
        }

        if (!companiesResponse.ok || !Array.isArray(companiesPayload)) {
          throw new Error(getMessage(companiesPayload, "Não foi possível carregar os estabelecimentos."));
        }

        if (!active) return;

        setClientName(clientPayload && "nomeCompleto" in clientPayload ? clientPayload.nomeCompleto : "");
        setCompanies(companiesPayload.map(mapCompany));
      } catch (requestError) {
        if (!active) return;

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar a página do cliente.";

        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadClientHome();

    return () => {
      active = false;
    };
  }, [router]);

  const filteredCompanies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return companies;

    return companies.filter((company) =>
      [
        company.businessName,
        company.description,
        company.address,
        company.city,
        company.uf,
        company.email,
        company.phone,
      ]
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
            Olá, {clientName || "cliente"}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Escolha um estabelecimento
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
        ) : error ? (
          <div className="glass mt-6 grid place-items-center rounded-3xl p-12 text-center text-muted-foreground">
            <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
            {error}
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
  const href = `/cliente/estabelecimento/${company.id}`;

  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/30 to-accent/30">
        {company.coverImageUrl ? (
          <div
            role="img"
            aria-label={company.businessName}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${company.coverImageUrl})` }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary-foreground/70">
            <Store className="h-12 w-12" />
          </div>
        )}
        <span className="glass-soft absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold">
          {company.servicesCount} {company.servicesCount === 1 ? "serviço" : "serviços"}
        </span>
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
              {company.address}
              {company.city ? `, ${company.city}` : ""}
              {company.uf ? ` - ${company.uf}` : ""}
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

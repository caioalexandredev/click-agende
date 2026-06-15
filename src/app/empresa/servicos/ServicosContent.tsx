"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Edit3,
  ImageOff,
  Loader2,
  Plus,
  Search,
  Scissors,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { CompanyHeader, useCompanyGuard } from "@/components/CompanyShell";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteServiceDialog } from "./_components/DeleteServiceDialog";
import { ServiceDialog } from "./_components/ServiceDialog";
import { serviceFormToPayload, type ServiceForm } from "./schema";
import type { Service } from "./types";

type ServiceResponse = {
  id: number;
  urlImagem?: string | null;
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
  disponivel?: boolean | null;
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function mapService(service: ServiceResponse): Service {
  return {
    id: String(service.id),
    name: service.nome,
    description: service.descricao ?? "",
    price: Number(service.preco),
    durationMin: Number(service.duracao),
    status: service.disponivel === false ? "inactive" : "active",
    imageUrl: service.urlImagem ?? "",
    appointmentsThisMonth: 0,
  };
}

export default function ServicosContent() {
  const { company, loading } = useCompanyGuard();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      setLoadingServices(true);

      try {
        const response = await fetch("/api/empresa/servicos");
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message ?? "Nao foi possivel carregar os servicos.");
        }

        if (active) setServices((payload as ServiceResponse[]).map(mapService));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar os servicos.");
      } finally {
        if (active) setLoadingServices(false);
      }
    }

    void loadServices();

    return () => {
      active = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesStatus = statusFilter === "all" || service.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [service.name, service.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, services, statusFilter]);

  const activeCount = services.filter((service) => service.status === "active").length;
  const appointmentsThisMonth = services.reduce(
    (total, service) => total + service.appointmentsThisMonth,
    0,
  );

  function openCreateDialog() {
    setEditingService(null);
    setDialogOpen(true);
  }

  function openEditDialog(service: Service) {
    setEditingService(service);
    setDialogOpen(true);
  }

  async function saveService(data: ServiceForm) {
    const payload = serviceFormToPayload(data);

    try {
      const response = await fetch(
        editingService ? `/api/empresa/servicos/${editingService.id}` : "/api/empresa/servicos",
        {
          method: editingService ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const responsePayload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responsePayload?.message ??
            (editingService ? "Nao foi possivel atualizar o servico." : "Nao foi possivel cadastrar o servico."),
        );
      }

      const saved = mapService(responsePayload as ServiceResponse);
      setServices((current) =>
        editingService
          ? current.map((service) => (service.id === saved.id ? saved : service))
          : [saved, ...current],
      );
      toast.success(editingService ? "Servico atualizado com sucesso." : "Servico cadastrado com sucesso.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar o servico.");
      return false;
    }
  }

  async function confirmDelete() {
    if (!deletingService) return;

    try {
      const response = await fetch(`/api/empresa/servicos/${deletingService.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Nao foi possivel excluir o servico.");
      }

      setServices((current) => current.filter((service) => service.id !== deletingService.id));
      toast.success("Servico excluido.");
      setDeletingService(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel excluir o servico.");
    }
  }

  if (loading || loadingServices) return <Center />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <CompanyHeader businessName={company?.business_name ?? ""} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <Link
          href="/empresa"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>

        <section className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Gerenciar Servicos</h1>
            <p className="mt-1 text-muted-foreground">
              Cadastre e organize os servicos oferecidos pelo estabelecimento.
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-primary">
            <Plus className="h-4 w-4" />
            Adicionar servico
          </Button>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<Scissors className="h-5 w-5" />}
            label="Servicos cadastrados"
            value={services.length.toString()}
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Servicos ativos"
            value={activeCount.toString()}
          />
          <MetricCard
            icon={<CalendarCheck className="h-5 w-5" />}
            label="Agendamentos no mes"
            value={appointmentsThisMonth.toString()}
          />
        </section>

        <section className="glass mt-6 rounded-3xl p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <FormInput
              id="service-search"
              label="Buscar servico"
              placeholder="Busque por nome ou descricao"
              value={query}
              icon={<Search className="h-4 w-4" />}
              onChange={(event) => setQuery(event.target.value)}
            />
            <FormSelect
              id="service-status"
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onValueChange={setStatusFilter}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.length ? (
              filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={() => openEditDialog(service)}
                  onDelete={() => setDeletingService(service)}
                />
              ))
            ) : (
              <EmptyState onCreate={openCreateDialog} />
            )}
          </div>
        </section>
      </main>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        onSubmit={saveService}
      />
      <DeleteServiceDialog
        service={deletingService}
        onOpenChange={(open) => {
          if (!open) setDeletingService(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const active = service.status === "active";

  return (
    <article className="glass-soft overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] bg-muted">
        {service.imageUrl && !imageError ? (
          <div
            role="img"
            aria-label={service.name}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${service.imageUrl})` }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
          {formatMoney(service.price)}
        </span>
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-medium shadow",
            active
              ? "bg-background/90 text-primary"
              : "bg-background/90 text-muted-foreground",
          )}
        >
          {active ? "Ativo" : "Inativo"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-bold">{service.name}</h2>
          </div>
        </div>

        {service.description ? (
          <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {service.description}
          </p>
        ) : (
          <p className="mt-2 min-h-10 text-sm text-muted-foreground">Sem descricao cadastrada.</p>
        )}

        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <InfoLine icon={<Clock className="h-4 w-4" />} text={`${service.durationMin} minutos`} />
          <InfoLine
            icon={<CalendarCheck className="h-4 w-4" />}
            text={`${service.appointmentsThisMonth} agendamentos no mes`}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Edit3 className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </Button>
        </div>
      </div>
    </article>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-primary">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center sm:col-span-2 lg:col-span-3">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Scissors className="h-5 w-5" />
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold">Nenhum servico encontrado</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Ajuste os filtros ou cadastre um novo servico para liberar novos agendamentos.
      </p>
      <Button onClick={onCreate} className="mt-4 bg-gradient-primary">
        <Plus className="h-4 w-4" />
        Adicionar servico
      </Button>
    </div>
  );
}

function Center() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

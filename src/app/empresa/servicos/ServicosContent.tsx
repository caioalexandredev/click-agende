"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

const MOCK_SERVICES: Service[] = [
  {
    id: "srv-1",
    name: "Corte feminino",
    description: "Corte personalizado com finalização simples.",
    price: 85,
    durationMin: 60,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
    appointmentsThisMonth: 34,
  },
  {
    id: "srv-2",
    name: "Barba completa",
    description: "Modelagem, toalha quente e acabamento com navalha.",
    price: 45,
    durationMin: 35,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
    appointmentsThisMonth: 22,
  },
  {
    id: "srv-3",
    name: "Manicure tradicional",
    description: "Cutilagem, esmaltação e hidratação rápida.",
    price: 38,
    durationMin: 50,
    status: "inactive",
    imageUrl: "",
    appointmentsThisMonth: 8,
  },
];

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

export default function ServicosContent() {
  const { company, loading } = useCompanyGuard();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

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

  function saveService(data: ServiceForm) {
    const payload = serviceFormToPayload(data);

    if (editingService) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingService.id ? { ...service, ...payload } : service,
        ),
      );
      toast.success("Serviço atualizado com sucesso.");
      return;
    }

    setServices((current) => [
      {
        id: `srv-${Date.now()}`,
        ...payload,
        appointmentsThisMonth: 0,
      },
      ...current,
    ]);
    toast.success("Serviço cadastrado com sucesso.");
  }

  function confirmDelete() {
    if (!deletingService) return;

    setServices((current) => current.filter((service) => service.id !== deletingService.id));
    toast.success("Serviço excluído.");
    setDeletingService(null);
  }

  if (loading) return <Center />;

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
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Gerenciar Serviços</h1>
            <p className="mt-1 text-muted-foreground">
              Cadastre e organize os serviços oferecidos pelo estabelecimento.
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-primary">
            <Plus className="h-4 w-4" />
            Adicionar serviço
          </Button>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<Scissors className="h-5 w-5" />}
            label="Serviços cadastrados"
            value={services.length.toString()}
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Serviços ativos"
            value={activeCount.toString()}
          />
          <MetricCard
            icon={<CalendarCheck className="h-5 w-5" />}
            label="Agendamentos no mês"
            value={appointmentsThisMonth.toString()}
          />
        </section>

        <section className="glass mt-6 rounded-3xl p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <FormInput
              id="service-search"
              label="Buscar serviço"
              placeholder="Busque por nome ou descrição"
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
          <p className="mt-2 min-h-10 text-sm text-muted-foreground">Sem descrição cadastrada.</p>
        )}

        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <InfoLine icon={<Clock className="h-4 w-4" />} text={`${service.durationMin} minutos`} />
          <InfoLine
            icon={<CalendarCheck className="h-4 w-4" />}
            text={`${service.appointmentsThisMonth} agendamentos no mês`}
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
      <h2 className="mt-3 font-display text-lg font-semibold">Nenhum serviço encontrado</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Ajuste os filtros ou cadastre um novo serviço para liberar novos agendamentos.
      </p>
      <Button onClick={onCreate} className="mt-4 bg-gradient-primary">
        <Plus className="h-4 w-4" />
        Adicionar serviço
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

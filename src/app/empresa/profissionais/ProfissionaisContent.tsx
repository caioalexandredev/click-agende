"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { CompanyHeader, useCompanyGuard } from "@/components/CompanyShell";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteProfessionalDialog } from "./_components/DeleteProfessionalDialog";
import { ProfessionalDialog } from "./_components/ProfessionalDialog";
import type { Professional, ProfessionalServiceOption } from "./types";
import type { ProfessionalForm } from "./schema";

type ServiceResponse = {
  id: number;
  nome: string;
  duracao: number;
};

type ProfessionalResponse = {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  especialidade: string;
  urlImagem?: string | null;
  biografia?: string | null;
  horarioInicio: string;
  horarioFim: string;
  disponivel?: boolean | null;
  servicos?: ServiceResponse[];
  atendimentos?: number | null;
  atendimentosSemana?: number | null;
  mediaAvaliacao?: number | null;
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const ITEMS_PER_PAGE = 6;

function toTime(value: string) {
  return value.slice(0, 5);
}

function mapService(service: ServiceResponse): ProfessionalServiceOption {
  return {
    id: String(service.id),
    name: service.nome,
    durationMin: Number(service.duracao),
  };
}

function mapProfessional(professional: ProfessionalResponse): Professional {
  return {
    id: professional.id,
    name: professional.nomeCompleto,
    role: professional.especialidade,
    phone: professional.telefone,
    email: professional.email,
    profileImageUrl: professional.urlImagem ?? "",
    workStart: toTime(professional.horarioInicio),
    workEnd: toTime(professional.horarioFim),
    serviceIds: professional.servicos?.map((service) => String(service.id)) ?? [],
    status: professional.disponivel === false ? "inactive" : "active",
    bio: professional.biografia ?? "",
    totalAppointments: Number(professional.atendimentos ?? 0),
    appointmentsThisWeek: Number(professional.atendimentosSemana ?? 0),
    rating: Number(professional.mediaAvaliacao ?? 0),
  };
}

export default function ProfissionaisContent() {
  const { company, loading } = useCompanyGuard();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<ProfessionalServiceOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoadingData(true);

      try {
        const [professionalsResponse, servicesResponse] = await Promise.all([
          fetch("/api/empresa/profissionais"),
          fetch("/api/empresa/servicos"),
        ]);
        const professionalsPayload = await professionalsResponse.json().catch(() => null);
        const servicesPayload = await servicesResponse.json().catch(() => null);

        if (!professionalsResponse.ok) {
          throw new Error(professionalsPayload?.message ?? "Não foi possível carregar os profissionais.");
        }
        if (!servicesResponse.ok) {
          throw new Error(servicesPayload?.message ?? "Não foi possível carregar os serviços.");
        }

        if (!active) return;
        setProfessionals((professionalsPayload as ProfessionalResponse[]).map(mapProfessional));
        setServices((servicesPayload as ServiceResponse[]).map(mapService));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível carregar os profissionais.");
      } finally {
        if (active) setLoadingData(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredProfessionals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return professionals.filter((professional) => {
      const professionalServices = services
        .filter((service) => professional.serviceIds.includes(service.id))
        .map((service) => service.name)
        .join(" ");
      const matchesStatus = statusFilter === "all" || professional.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          professional.name,
          professional.role,
          professional.email,
          professional.phone,
          professionalServices,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [professionals, query, services, statusFilter]);

  const activeCount = professionals.filter((professional) => professional.status === "active").length;
  const appointmentsThisWeek = professionals.reduce(
    (total, professional) => total + professional.appointmentsThisWeek,
    0,
  );
  const totalPages = Math.max(1, Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProfessionals = filteredProfessionals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function openCreateDialog() {
    setEditingProfessional(null);
    setDialogOpen(true);
  }

  function openEditDialog(professional: Professional) {
    setEditingProfessional(professional);
    setDialogOpen(true);
  }

  async function saveProfessional(data: ProfessionalForm) {
    try {
      const response = await fetch(
        editingProfessional
          ? `/api/empresa/profissionais/${editingProfessional.id}`
          : "/api/empresa/profissionais",
        {
          method: editingProfessional ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message ??
            (editingProfessional
              ? "Não foi possível atualizar o profissional."
              : "Não foi possível cadastrar o profissional."),
        );
      }

      const saved = mapProfessional(payload as ProfessionalResponse);
      setProfessionals((current) =>
        editingProfessional
          ? current.map((professional) => (professional.id === saved.id ? saved : professional))
          : [saved, ...current],
      );
      if (!editingProfessional) setPage(1);
      toast.success(editingProfessional ? "Profissional atualizado com sucesso." : "Profissional cadastrado com sucesso.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o profissional.");
      return false;
    }
  }

  async function confirmDelete() {
    if (!deletingProfessional) return;

    try {
      const response = await fetch(`/api/empresa/profissionais/${deletingProfessional.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Não foi possível excluir o profissional.");
      }

      setProfessionals((current) =>
        current.filter((professional) => professional.id !== deletingProfessional.id),
      );
      toast.success("Profissional excluído.");
      setDeletingProfessional(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o profissional.");
    }
  }

  if (loading || loadingData) return <Center />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <CompanyHeader businessName={company?.business_name ?? ""} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <section className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Profissionais</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie a equipe que atende os serviços do seu estabelecimento.
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-primary">
            <Plus className="h-4 w-4" />
            Novo profissional
          </Button>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<UserRound className="h-5 w-5" />}
            label="Profissionais cadastrados"
            value={professionals.length.toString()}
          />
          <MetricCard
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            label="Ativos na agenda"
            value={activeCount.toString()}
          />
          <MetricCard
            icon={<CalendarCheck className="h-5 w-5" />}
            label="Atendimentos na semana"
            value={appointmentsThisWeek.toString()}
          />
        </section>

        <section className="glass mt-6 rounded-3xl p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <FormInput
              id="professional-search"
              label="Buscar profissional"
              placeholder="Busque por nome, especialidade, email ou telefone"
              value={query}
              icon={<Search className="h-4 w-4" />}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            <FormSelect
              id="professional-status"
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            />
          </div>

          <div className="mt-6 grid gap-4">
            {filteredProfessionals.length ? (
              <>
                {paginatedProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    services={services}
                    onEdit={() => openEditDialog(professional)}
                    onDelete={() => setDeletingProfessional(professional)}
                  />
                ))}
                {totalPages > 1 ? (
                  <ListPagination
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProfessionals.length}
                    onPageChange={setPage}
                  />
                ) : null}
              </>
            ) : (
              <EmptyState onCreate={openCreateDialog} />
            )}
          </div>
        </section>
      </main>

      <ProfessionalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        professional={editingProfessional}
        serviceOptions={services}
        onSubmit={saveProfessional}
      />
      <DeleteProfessionalDialog
        professional={deletingProfessional}
        onOpenChange={(open) => {
          if (!open) setDeletingProfessional(null);
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

function ProfessionalCard({
  professional,
  services,
  onEdit,
  onDelete,
}: {
  professional: Professional;
  services: ProfessionalServiceOption[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const active = professional.status === "active";
  const professionalServices = services.filter((service) => professional.serviceIds.includes(service.id));

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <ProfileAvatar professional={professional} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-lg font-semibold">{professional.name}</h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{professional.role}</p>
            {professional.bio ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{professional.bio}</p>
            ) : null}
            <div className="mt-3 flex max-w-2xl flex-wrap gap-1.5">
              {professionalServices.length ? (
                professionalServices.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {service.name}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Nenhum serviço vinculado
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <InfoLine icon={<Phone className="h-4 w-4" />} text={professional.phone} />
          <InfoLine icon={<Mail className="h-4 w-4" />} text={professional.email} />
          <InfoLine
            icon={<CalendarCheck className="h-4 w-4" />}
            text={`${professional.totalAppointments} atendimentos`}
          />
          <InfoLine
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            text={`${professional.appointmentsThisWeek} na semana`}
          />
          <InfoLine
            icon={<Clock className="h-4 w-4" />}
            text={`${professional.workStart} às ${professional.workEnd}`}
          />
          <InfoLine icon={<Star className="h-4 w-4" />} text={`${professional.rating.toFixed(1)} avaliação`} />
        </div>

        <div className="flex gap-2 lg:self-start">
          <Button variant="outline" size="icon" onClick={onEdit} aria-label={`Editar ${professional.name}`}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            aria-label={`Remover ${professional.name}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProfileAvatar({ professional }: { professional: Professional }) {
  const [imageError, setImageError] = useState(false);

  if (professional.profileImageUrl && !imageError) {
    return (
      <div
        role="img"
        aria-label={`Foto de ${professional.name}`}
        className="h-12 w-12 shrink-0 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${professional.profileImageUrl})` }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="bg-gradient-primary grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary-foreground">
      <UserRound className="h-5 w-5" />
    </div>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <span className="shrink-0 text-primary">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function ListPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const from = (page - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(page * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/45 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs font-medium text-muted-foreground sm:text-left">
        Mostrando {from}-{to} de {totalItems}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          disabled={page === 1}
          aria-label="Página anterior"
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-24 text-center text-xs font-semibold text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          disabled={page === totalPages}
          aria-label="Próxima página"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <UserRound className="h-5 w-5" />
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold">Nenhum profissional encontrado</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Ajuste os filtros ou cadastre um novo profissional para começar a montar sua equipe.
      </p>
      <Button onClick={onCreate} className="mt-4 bg-gradient-primary">
        <Plus className="h-4 w-4" />
        Novo profissional
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

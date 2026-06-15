"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarCheck,
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
import type { Professional } from "./types";
import type { ProfessionalForm } from "./schema";

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "pro-1",
    name: "Ana Beatriz Souza",
    role: "Cabeleireira",
    phone: "(63) 99912-3344",
    email: "ana@clickagende.com",
    workStart: "08:00",
    workEnd: "17:00",
    status: "active",
    bio: "Especialista em cortes femininos, escova e finalização.",
    appointmentsThisWeek: 18,
    rating: 4.9,
  },
  {
    id: "pro-2",
    name: "Marcos Vinícius Lima",
    role: "Barbeiro",
    phone: "(63) 99888-1020",
    email: "marcos@clickagende.com",
    workStart: "09:00",
    workEnd: "19:00",
    status: "active",
    bio: "Atende cortes masculinos, barba e acabamento.",
    appointmentsThisWeek: 14,
    rating: 4.8,
  },
  {
    id: "pro-3",
    name: "Juliana Carvalho",
    role: "Manicure",
    phone: "(63) 99777-4500",
    email: "juliana@clickagende.com",
    workStart: "08:30",
    workEnd: "16:30",
    status: "inactive",
    bio: "Horários temporariamente pausados para reorganização da agenda.",
    appointmentsThisWeek: 0,
    rating: 4.7,
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

export default function ProfissionaisPage() {
  const { company, loading } = useCompanyGuard();
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);

  const filteredProfessionals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return professionals.filter((professional) => {
      const matchesStatus = statusFilter === "all" || professional.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [professional.name, professional.role, professional.email, professional.phone]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [professionals, query, statusFilter]);

  const activeCount = professionals.filter((professional) => professional.status === "active").length;
  const appointmentsThisWeek = professionals.reduce(
    (total, professional) => total + professional.appointmentsThisWeek,
    0,
  );

  function openCreateDialog() {
    setEditingProfessional(null);
    setDialogOpen(true);
  }

  function openEditDialog(professional: Professional) {
    setEditingProfessional(professional);
    setDialogOpen(true);
  }

  function saveProfessional(data: ProfessionalForm) {
    if (editingProfessional) {
      setProfessionals((current) =>
        current.map((professional) =>
          professional.id === editingProfessional.id ? { ...professional, ...data } : professional,
        ),
      );
      toast.success("Profissional atualizado com sucesso.");
      return;
    }

    setProfessionals((current) => [
      {
        id: `pro-${Date.now()}`,
        ...data,
        appointmentsThisWeek: 0,
        rating: 5,
      },
      ...current,
    ]);
    toast.success("Profissional cadastrado com sucesso.");
  }

  function confirmDelete() {
    if (!deletingProfessional) return;

    setProfessionals((current) =>
      current.filter((professional) => professional.id !== deletingProfessional.id),
    );
    toast.success("Profissional removido.");
    setDeletingProfessional(null);
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
              onChange={(event) => setQuery(event.target.value)}
            />
            <FormSelect
              id="professional-status"
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onValueChange={setStatusFilter}
            />
          </div>

          <div className="mt-6 grid gap-4">
            {filteredProfessionals.length ? (
              filteredProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onEdit={() => openEditDialog(professional)}
                  onDelete={() => setDeletingProfessional(professional)}
                />
              ))
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
  onEdit,
  onDelete,
}: {
  professional: Professional;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const active = professional.status === "active";

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="bg-gradient-primary grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary-foreground">
            <UserRound className="h-5 w-5" />
          </div>
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
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <InfoLine icon={<Phone className="h-4 w-4" />} text={professional.phone} />
          <InfoLine icon={<Mail className="h-4 w-4" />} text={professional.email} />
          <InfoLine
            icon={<CalendarCheck className="h-4 w-4" />}
            text={`${professional.appointmentsThisWeek} atendimentos`}
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

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <span className="shrink-0 text-primary">{icon}</span>
      <span className="truncate">{text}</span>
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Phone,
  Plus,
  Save,
  Scissors,
  UserRound,
  Users2,
  X,
  XCircle,
} from "lucide-react";

import { MiniCalendar, dateToYMD } from "@/components/MiniCalendar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApptStatus = "pending" | "cancelled" | "completed";

type ManualStatus = "AGENDADO" | "CANCELADO" | "FINALIZADO";

type Appt = {
  id: string;
  client_name: string;
  professional_id?: string | null;
  professional_name: string;
  service_name: string;
  service_price: number;
  service_duration_min: number;
  scheduled_at: string;
  status: ApptStatus;
};

type AgendaResponse = {
  id: string;
  dataHora: string;
  statusAgendamento: "AGENDADO" | "CANCELADO" | "FINALIZADO" | string;
  tempoAtendimento?: number | null;
  valorTotal?: number | null;
  idFuncionario?: string | null;
  funcionario?: string | null;
  cliente?: string | null;
  servicos?: Array<{
    nome?: string | null;
    preco?: number | null;
    duracao?: number | null;
  }>;
};

type CompanyService = {
  id: string;
  name: string;
  price: number;
  durationMin: number;
};

type CompanyProfessional = {
  id: string;
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  serviceIds: string[];
};

type ServiceResponse = {
  id: number;
  nome: string;
  preco: number;
  duracao: number;
};

type ProfessionalResponse = {
  id: string;
  nomeCompleto: string;
  especialidade?: string | null;
  horarioInicio?: string | null;
  horarioFim?: string | null;
  servicos?: ServiceResponse[];
};

type ClientLookupResponse = {
  id: string;
  nomeCompleto?: string | null;
  cpf?: string | null;
  telefone?: string | null;
};

type ManualAppointmentForm = {
  clientName: string;
  cpf: string;
  phone: string;
  professionalId: string;
  serviceIds: string[];
  date: string;
  time: string;
  status: ManualStatus;
  observation: string;
};

const INITIAL_MANUAL_FORM: ManualAppointmentForm = {
  clientName: "",
  cpf: "",
  phone: "",
  professionalId: "",
  serviceIds: [],
  date: new Date().toISOString().slice(0, 10),
  time: "",
  status: "FINALIZADO",
  observation: "",
};

const MANUAL_STATUS_OPTIONS = [
  { value: "AGENDADO", label: "Agendado" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const APPOINTMENTS_PER_PAGE = 3;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function brDate(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calc = (base: string, factor: number) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }
    const result = (total * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return calc(cpf.slice(0, 9), 10) === Number(cpf[9]) && calc(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

function mapStatus(status: AgendaResponse["statusAgendamento"]): ApptStatus {
  if (status === "CANCELADO") return "cancelled";
  if (status === "FINALIZADO") return "completed";
  return "pending";
}

function mapCompanyService(service: ServiceResponse): CompanyService {
  return {
    id: String(service.id),
    name: service.nome,
    price: Number(service.preco),
    durationMin: Number(service.duracao),
  };
}

function mapCompanyProfessional(professional: ProfessionalResponse): CompanyProfessional {
  return {
    id: professional.id,
    name: professional.nomeCompleto,
    role: professional.especialidade ?? "Profissional",
    startTime: professional.horarioInicio?.slice(0, 5) || "08:00",
    endTime: professional.horarioFim?.slice(0, 5) || "18:00",
    serviceIds: professional.servicos?.map((service) => String(service.id)) ?? [],
  };
}

function mapAppointment(agenda: AgendaResponse): Appt {
  const services = agenda.servicos ?? [];
  const serviceNames = services.map((service) => service.nome).filter(Boolean).join(", ");
  const servicePrice =
    agenda.valorTotal ?? services.reduce((total, service) => total + Number(service.preco ?? 0), 0);
  const serviceDuration =
    agenda.tempoAtendimento ?? services.reduce((total, service) => total + Number(service.duracao ?? 0), 0);

  return {
    id: agenda.id,
    client_name: agenda.cliente ?? "Cliente",
    professional_id: agenda.idFuncionario ?? null,
    professional_name: agenda.funcionario ?? "Profissional",
    service_name: serviceNames || "Serviço",
    service_price: Number(servicePrice),
    service_duration_min: Number(serviceDuration),
    scheduled_at: agenda.dataHora,
    status: mapStatus(agenda.statusAgendamento),
  };
}

export default function CompanyDashboardContent() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    appointment: Appt;
    status: Exclude<ApptStatus, "pending">;
  } | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualResources, setManualResources] = useState<{
    professionals: CompanyProfessional[];
    services: CompanyService[];
  }>({ professionals: [], services: [] });
  const [loadingManualResources, setLoadingManualResources] = useState(false);

  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState<Date>(today);
  const [month, setMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [dayPage, setDayPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoadingDashboard(true);

      try {
        const [companyResponse, agendaResponse] = await Promise.all([
          fetch("/api/empresa/me"),
          fetch("/api/empresa/agenda"),
        ]);
        const companyPayload = await companyResponse.json().catch(() => null);
        const agendaPayload = await agendaResponse.json().catch(() => null);

        if (!companyResponse.ok) {
          throw new Error(companyPayload?.message ?? "Não foi possível carregar a empresa.");
        }
        if (!agendaResponse.ok) {
          throw new Error(agendaPayload?.message ?? "Não foi possível carregar os agendamentos.");
        }

        if (!active) return;
        setBusinessName(companyPayload?.nome ?? "");
        setAppts((agendaPayload as AgendaResponse[]).map(mapAppointment));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível carregar o dashboard.");
      } finally {
        if (active) setLoadingDashboard(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const monthAppts = useMemo(() => {
    const from = new Date(month.getFullYear(), month.getMonth(), 1);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);

    return appts.filter((appt) => {
      const scheduledAt = new Date(appt.scheduled_at);
      return scheduledAt >= from && scheduledAt < to;
    });
  }, [appts, month]);

  const dayAppts = useMemo(() => {
    const from = startOfDay(selected);
    const to = endOfDay(selected);

    return appts
      .filter((appt) => {
        const scheduledAt = new Date(appt.scheduled_at);
        return scheduledAt >= from && scheduledAt <= to;
      })
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }, [appts, selected]);

  const todayAppts = useMemo(() => {
    const from = startOfDay(today);
    const to = endOfDay(today);

    return appts.filter((appt) => {
      const scheduledAt = new Date(appt.scheduled_at);
      return scheduledAt >= from && scheduledAt <= to;
    });
  }, [appts, today]);

  const highlighted = useMemo(() => {
    const s = new Set<string>();
    for (const a of monthAppts) s.add(dateToYMD(new Date(a.scheduled_at)));
    return s;
  }, [monthAppts]);

  const todayCount = todayAppts.filter((a) => a.status !== "cancelled").length;
  const todayPending = todayAppts.filter((a) => a.status === "pending").length;
  const todayCompleted = todayAppts.filter((a) => a.status === "completed").length;
  const dayTotalPages = Math.max(1, Math.ceil(dayAppts.length / APPOINTMENTS_PER_PAGE));
  const paginatedDayAppts = dayAppts.slice(
    (dayPage - 1) * APPOINTMENTS_PER_PAGE,
    dayPage * APPOINTMENTS_PER_PAGE,
  );

  async function updateStatus(id: string, status: Exclude<ApptStatus, "pending">) {
    const endpoint = status === "completed" ? "confirmar" : "cancelar";

    try {
      const response = await fetch(`/api/empresa/agenda/${id}/${endpoint}`, { method: "PATCH" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Não foi possível atualizar o agendamento.");
      }

      const updated = mapAppointment(payload as AgendaResponse);
      setAppts((current) => current.map((appt) => (appt.id === updated.id ? updated : appt)));
      toast.success(status === "completed" ? "Agendamento finalizado." : "Agendamento cancelado.");
      setPendingAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o agendamento.");
    }
  }

  async function openManualDialog() {
    setManualOpen(true);

    if (manualResources.professionals.length || manualResources.services.length) return;

    setLoadingManualResources(true);

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

      setManualResources({
        professionals: (professionalsPayload as ProfessionalResponse[]).map(mapCompanyProfessional),
        services: (servicesPayload as ServiceResponse[]).map(mapCompanyService),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o formulário.");
    } finally {
      setLoadingManualResources(false);
    }
  }

  function handleManualCreated(agenda: AgendaResponse) {
    const created = mapAppointment(agenda);
    setAppts((current) => [created, ...current]);
    setSelected(new Date(created.scheduled_at));
    setDayPage(1);
    setManualOpen(false);
    toast.success("Agendamento manual cadastrado.");
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/empresa/login");
  }

  if (loadingDashboard) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

      <CompanyHeader
        businessName={businessName}
        onSignOut={signOut}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Agendamentos Hoje"
            value={todayCount}
            icon={<CalendarDays className="h-5 w-5" />}
            tone="primary"
          />
          <SummaryCard
            label="Pendentes"
            value={todayPending}
            icon={<AlertCircle className="h-5 w-5" />}
            tone="warning"
          />
          <SummaryCard
            label="Finalizados"
            value={todayCompleted}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="success"
          />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
          <div className="glass rounded-3xl p-5">
            <MiniCalendar
              month={month}
              selected={selected}
              onSelect={(date) => {
                setSelected(date);
                setDayPage(1);
              }}
              onMonthChange={setMonth}
              highlightedDays={highlighted}
            />
          </div>

          <div className="glass rounded-3xl p-5">
            <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-bold sm:text-xl">
                  Agendamentos - {brDate(selected)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {dayAppts.length} item{dayAppts.length === 1 ? "" : "s"} no dia
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {dayAppts.length === 0 ? (
                <EmptyDay />
              ) : (
                <>
                  {paginatedDayAppts.map((a) => (
                    <AppointmentItem
                      key={a.id}
                      a={a}
                      onRequestUpdate={(status) => setPendingAction({ appointment: a, status })}
                    />
                  ))}
                  {dayTotalPages > 1 ? (
                    <AppointmentPagination
                      page={dayPage}
                      totalPages={dayTotalPages}
                      totalItems={dayAppts.length}
                      onPageChange={setDayPage}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <AppointmentActionDialog
        action={pendingAction}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        onConfirm={() => {
          if (pendingAction) void updateStatus(pendingAction.appointment.id, pendingAction.status);
        }}
      />

      <button
        type="button"
        title="Adicionar Atendimento"
        aria-label="Adicionar Atendimento"
        onClick={openManualDialog}
        className="bg-gradient-primary fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-xl shadow-primary/25 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ManualAppointmentDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        loadingResources={loadingManualResources}
        professionals={manualResources.professionals}
        services={manualResources.services}
        appointments={appts}
        onCreated={handleManualCreated}
      />
    </div>
  );
}

function CompanyHeader({
  businessName,
  onSignOut,
  navOpen,
  setNavOpen,
}: {
  businessName: string;
  onSignOut: () => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const items = [
    { href: "/empresa", label: "Dashboard", icon: LayoutDashboard },
    { href: "/empresa/dados", label: "Empresa", icon: Building2 },
    { href: "/empresa/profissionais", label: "Profissionais", icon: Users2 },
    { href: "/empresa/servicos", label: "Serviços", icon: Scissors },
  ];

  return (
    <header className="relative z-20">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-gradient-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-lg">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-bold sm:text-lg">
                {businessName || "Sua empresa"}
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Painel de gestão do estabelecimento
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {items.map((it) => {
              const active = pathname === it.href;
              return (
                <NavLink key={it.href} href={it.href} active={active}>
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" onClick={onSignOut} className="hidden gap-1.5 sm:inline-flex">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
            <button
              type="button"
              onClick={() => setNavOpen(!navOpen)}
              className="glass-soft grid h-10 w-10 place-items-center rounded-full lg:hidden"
              aria-label="Menu"
            >
              {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {navOpen ? (
          <div className="glass mt-2 grid gap-1 rounded-2xl p-2 lg:hidden">
            {items.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    active ? "bg-primary/15 text-primary" : "hover:bg-primary/10"
                  }`}
                >
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-primary/10"
      }`}
    >
      {children}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: "primary" | "warning" | "success";
}) {
  const ring =
    tone === "primary"
      ? "bg-primary/15 text-primary"
      : tone === "warning"
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-4xl font-extrabold leading-none">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${ring}`}>{icon}</span>
      </div>
    </div>
  );
}

function AppointmentItem({
  a,
  onRequestUpdate,
}: {
  a: Appt;
  onRequestUpdate: (s: Exclude<ApptStatus, "pending">) => void;
}) {
  return (
    <div className="glass-soft rounded-2xl p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate font-display text-base font-bold">{a.client_name}</h4>
            <StatusBadge status={a.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Profissional: <span className="text-foreground">{a.professional_name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {a.service_name} - {brl(Number(a.service_price))} ({a.service_duration_min}min)
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
            <Clock className="h-3.5 w-3.5" />
            {hhmm(a.scheduled_at)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total <span className="font-semibold text-foreground">{brl(Number(a.service_price))}</span>
          </p>
        </div>
      </div>

      {a.status === "pending" ? (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="bg-gradient-primary h-9 flex-1"
            onClick={() => onRequestUpdate("completed")}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Finalizar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 flex-1"
            onClick={() => onRequestUpdate("cancelled")}
          >
            <XCircle className="mr-1.5 h-4 w-4" /> Cancelar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function AppointmentPagination({
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
  const from = (page - 1) * APPOINTMENTS_PER_PAGE + 1;
  const to = Math.min(page * APPOINTMENTS_PER_PAGE, totalItems);

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

function AppointmentActionDialog({
  action,
  onOpenChange,
  onConfirm,
}: {
  action: { appointment: Appt; status: Exclude<ApptStatus, "pending"> } | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isCancel = action?.status === "cancelled";
  const title = isCancel ? "Cancelar agendamento?" : "Finalizar agendamento?";
  const actionText = isCancel ? "Confirmar cancelamento" : "Confirmar finalização";
  const description = action
    ? isCancel
      ? `Você está cancelando o agendamento de ${action.appointment.client_name}. Esta ação altera o status do atendimento.`
      : `Você está finalizando o agendamento de ${action.appointment.client_name}. Confirme apenas se o atendimento foi concluído.`
    : "";

  return (
    <AlertDialog open={Boolean(action)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className={`mb-2 grid h-10 w-10 place-items-center rounded-full ${
            isCancel ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}>
            {isCancel ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={isCancel ? "destructive" : "default"} onClick={onConfirm}>
              {actionText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ManualAppointmentDialog({
  open,
  onOpenChange,
  loadingResources,
  professionals,
  services,
  appointments,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingResources: boolean;
  professionals: CompanyProfessional[];
  services: CompanyService[];
  appointments: Appt[];
  onCreated: (agenda: AgendaResponse) => void;
}) {
  const [form, setForm] = useState<ManualAppointmentForm>(INITIAL_MANUAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ManualAppointmentForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [existingClient, setExistingClient] = useState<ClientLookupResponse | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  const selectedProfessional = professionals.find((professional) => professional.id === form.professionalId);
  const availableServices = selectedProfessional
    ? services.filter((service) => selectedProfessional.serviceIds.includes(service.id))
    : services;
  const selectedServices = services.filter((service) => form.serviceIds.includes(service.id));
  const totalDuration = selectedServices.reduce((total, service) => total + service.durationMin, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);
  const slots = buildManualSlots({
    professional: selectedProfessional,
    date: form.date,
    selectedServices,
    appointments,
  });
  const hasRequiredScheduleFields = Boolean(form.professionalId && form.date && form.serviceIds.length > 0);
  const shouldShowNoSlots = hasRequiredScheduleFields && slots.length === 0;
  const isSelectedTimeAvailable = Boolean(form.time && slots.includes(form.time));

  useEffect(() => {
    const cpf = onlyDigits(form.cpf);

    if (cpf.length !== 11 || !isValidCpf(cpf)) {
      return;
    }

    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoadingClient(true);

      try {
        const response = await fetch(`/api/empresa/clientes/cpf/${cpf}`);

        if (response.status === 404) {
          if (active) setExistingClient(null);
          return;
        }

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message ?? "Não foi possível buscar o cliente.");
        }

        if (!active || !payload) return;

        const cliente = payload as ClientLookupResponse;
        setExistingClient(cliente);
        setForm((current) => {
          if (onlyDigits(current.cpf) !== cpf) return current;

          return {
            ...current,
            clientName: cliente.nomeCompleto ?? current.clientName,
            phone: current.phone || maskPhone(cliente.telefone ?? ""),
          };
        });
        setErrors((current) => ({ ...current, clientName: undefined }));
      } catch (error) {
        if (active) {
          setExistingClient(null);
          toast.error(error instanceof Error ? error.message : "Não foi possível buscar o cliente.");
        }
      } finally {
        if (active) setLoadingClient(false);
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [form.cpf]);

  function set<K extends keyof ManualAppointmentForm>(key: K, value: ManualAppointmentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function reset() {
    setForm(INITIAL_MANUAL_FORM);
    setErrors({});
    setExistingClient(null);
    setLoadingClient(false);
  }

  function close(openNext: boolean) {
    onOpenChange(openNext);
    if (!openNext) reset();
  }

  function validate() {
    const nextErrors: Partial<Record<keyof ManualAppointmentForm, string>> = {};

    if (!form.clientName.trim()) nextErrors.clientName = "Nome do cliente é obrigatório.";
    else if (form.clientName.length > 150) nextErrors.clientName = "Máximo de 150 caracteres.";

    if (!form.cpf.trim()) nextErrors.cpf = "CPF é obrigatório.";
    else if (!isValidCpf(form.cpf)) nextErrors.cpf = "Digite um CPF válido.";

    if (!form.phone.trim()) nextErrors.phone = "Telefone é obrigatório.";
    else if (![10, 11].includes(onlyDigits(form.phone).length)) {
      nextErrors.phone = "Digite um telefone válido.";
    }

    if (!form.professionalId) nextErrors.professionalId = "Selecione um profissional.";
    if (form.serviceIds.length === 0) nextErrors.serviceIds = "Selecione ao menos um serviço.";
    if (!form.date) nextErrors.date = "Data é obrigatória.";
    if (shouldShowNoSlots) nextErrors.time = "Não há horários disponíveis para essa combinação.";
    else if (!form.time) nextErrors.time = "Horário é obrigatório.";
    else if (hasRequiredScheduleFields && !isSelectedTimeAvailable) {
      nextErrors.time = "Selecione um horário disponível.";
    }
    if (!form.status) nextErrors.status = "Status é obrigatório.";
    if (form.observation.length > 300) nextErrors.observation = "Máximo de 300 caracteres.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function toggleService(serviceId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      serviceIds: checked
        ? [...current.serviceIds, serviceId]
        : current.serviceIds.filter((id) => id !== serviceId),
      time: "",
    }));
    setErrors((current) => ({ ...current, serviceIds: undefined, time: undefined }));
  }

  async function submit() {
    if (!validate()) {
      toast.error("Corrija os campos destacados.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/empresa/agenda/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nomeCliente: form.clientName.trim(),
          cpfCliente: form.cpf,
          telefoneCliente: form.phone,
          idFuncionario: form.professionalId,
          dataHoraAgendamento: `${form.date}T${form.time}:00`,
          servicos: form.serviceIds.map(Number),
          statusAgendamento: form.status,
          observacao: form.observation.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Não foi possível cadastrar o agendamento manual.");
      }

      onCreated(payload as AgendaResponse);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cadastrar o agendamento manual.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar atendimento</DialogTitle>
          <DialogDescription>
            Cadastre um atendimento manual e associe ao cliente por CPF para vínculo futuro.
          </DialogDescription>
        </DialogHeader>

        {loadingResources ? (
          <div className="grid min-h-72 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-5">
            <section className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="manual-client-cpf"
                required
                label="CPF"
                value={form.cpf}
                error={errors.cpf}
                hint={
                  loadingClient
                    ? "Buscando cliente..."
                    : existingClient
                      ? "Cliente já cadastrado. O nome foi preenchido automaticamente."
                      : undefined
                }
                placeholder="000.000.000-00"
                inputMode="numeric"
                onChange={(event) => {
                  const cpf = maskCpf(event.target.value);
                  const cpfDigits = onlyDigits(cpf);
                  const changedExistingCpf = existingClient && onlyDigits(cpf) !== onlyDigits(existingClient.cpf ?? "");
                  setForm((current) => ({
                    ...current,
                    cpf,
                    clientName: changedExistingCpf ? "" : current.clientName,
                  }));
                  setErrors((current) => ({ ...current, cpf: undefined, clientName: undefined }));
                  if (changedExistingCpf || cpfDigits.length !== 11) setExistingClient(null);
                  if (cpfDigits.length !== 11) setLoadingClient(false);
                }}
              />
              <FormInput
                id="manual-client-name"
                required
                label="Nome do Cliente"
                value={form.clientName}
                error={errors.clientName}
                icon={<UserRound className="h-4 w-4" />}
                placeholder="Ex: João Silva"
                maxLength={150}
                disabled={Boolean(existingClient)}
                className={existingClient ? "disabled:opacity-100" : undefined}
                onChange={(event) => set("clientName", event.target.value)}
              />
              <FormInput
                id="manual-client-phone"
                required
                label="Telefone"
                value={form.phone}
                error={errors.phone}
                icon={<Phone className="h-4 w-4" />}
                placeholder="(11) 99999-9999"
                inputMode="tel"
                onChange={(event) => set("phone", maskPhone(event.target.value))}
              />
              <FormSelect
                id="manual-status"
                required
                label="Status"
                value={form.status}
                options={MANUAL_STATUS_OPTIONS}
                error={errors.status}
                onValueChange={(value) => set("status", value as ManualStatus)}
              />
            </section>

            <section className="grid gap-4">
              <FormSelect
                id="manual-professional"
                required
                label="Profissional"
                placeholder="Selecione o profissional"
                value={form.professionalId}
                options={professionals.map((professional) => ({
                  value: professional.id,
                  label: `${professional.name} - ${professional.role}`,
                }))}
                error={errors.professionalId}
                onValueChange={(value) => {
                  const professional = professionals.find((item) => item.id === value);
                  setForm((current) => ({
                    ...current,
                    professionalId: value,
                    serviceIds: current.serviceIds.filter((id) => professional?.serviceIds.includes(id)),
                    time: "",
                  }));
                  setErrors((current) => ({
                    ...current,
                    professionalId: undefined,
                    serviceIds: undefined,
                    time: undefined,
                  }));
                }}
              />
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  <span className="text-destructive">*</span> Serviços realizados
                </p>
                <span className="text-xs font-semibold text-primary">
                  {form.serviceIds.length} selecionado{form.serviceIds.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid max-h-64 gap-2 overflow-auto rounded-xl border border-input bg-background/60 p-3 sm:grid-cols-2">
                {availableServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    Selecione um profissional com serviços vinculados.
                  </p>
                ) : (
                  availableServices.map((service) => {
                    const checked = form.serviceIds.includes(service.id);

                    return (
                      <label
                        key={service.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm transition hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => toggleService(service.id, Boolean(value))}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{service.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {service.durationMin} min - {brl(service.price)}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {errors.serviceIds ? (
                <p className="mt-1.5 text-xs text-destructive">{errors.serviceIds}</p>
              ) : null}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="manual-date"
                required
                label="Data"
                type="date"
                value={form.date}
                error={errors.date}
                onChange={(event) => {
                  setForm((current) => ({ ...current, date: event.target.value, time: "" }));
                  setErrors((current) => ({ ...current, date: undefined, time: undefined }));
                }}
              />
              <FormSelect
                id="manual-time"
                required
                label="Horário"
                value={form.time}
                error={errors.time}
                placeholder={
                  !hasRequiredScheduleFields
                    ? "Selecione profissional, serviços e data"
                    : shouldShowNoSlots
                      ? "Nenhum horário disponível"
                      : "Selecione um horário"
                }
                disabled={!hasRequiredScheduleFields || shouldShowNoSlots}
                options={slots.map((slot) => ({ value: slot, label: slot }))}
                onValueChange={(value) => set("time", value)}
              />
            </section>
            {shouldShowNoSlots ? (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-5">
                  Não há horários disponíveis para esse profissional, data e duração dos serviços.
                </p>
              </div>
            ) : hasRequiredScheduleFields && form.time && !isSelectedTimeAvailable ? (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-5">
                  Esse horário não comporta o atendimento selecionado. Escolha um horário livre entre{" "}
                  {slots.slice(0, 5).join(", ")}
                  {slots.length > 5 ? "..." : "."}
                </p>
              </div>
            ) : null}

            <FormTextarea
              id="manual-observation"
              label="Observação"
              value={form.observation}
              error={errors.observation}
              hint={`${form.observation.length}/300`}
              placeholder="Notas sobre o atendimento..."
              maxLength={300}
              className="min-h-24"
              onChange={(event) => set("observation", event.target.value)}
            />

            {form.serviceIds.length > 0 ? (
              <div className="glass-soft grid gap-3 rounded-2xl p-3 text-sm sm:grid-cols-2 sm:gap-4">
                <p className="flex items-center justify-between gap-4 rounded-xl bg-background/40 px-3 py-2">
                  <span className="text-muted-foreground">Duração total</span>
                  <span className="shrink-0 font-semibold">{totalDuration} min</span>
                </p>
                <p className="flex items-center justify-between gap-4 rounded-xl bg-background/40 px-3 py-2">
                  <span className="text-muted-foreground">Valor total</span>
                  <span className="shrink-0 font-bold text-primary">{brl(totalPrice)}</span>
                </p>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => close(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={saving || loadingResources} className="bg-gradient-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar atendimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: ApptStatus }) {
  const map = {
    pending: {
      label: "Agendado",
      cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    cancelled: {
      label: "Cancelado",
      cls: "bg-destructive/15 text-destructive border-destructive/30",
    },
    completed: {
      label: "Finalizado",
      cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
  } as const;
  const m = map[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function EmptyDay() {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
      <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
      <p className="mt-3 font-display text-base font-semibold">Nenhum agendamento</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Não há agendamentos para a data selecionada.
      </p>
    </div>
  );
}

function buildManualSlots({
  professional,
  date,
  selectedServices,
  appointments,
}: {
  professional?: CompanyProfessional;
  date: string;
  selectedServices: CompanyService[];
  appointments: Appt[];
}) {
  if (!professional || !date || selectedServices.length === 0) return [];

  const totalDuration = selectedServices.reduce((acc, service) => acc + service.durationMin, 0);
  if (totalDuration <= 0) return [];

  const busy = appointments
    .filter(
      (appointment) =>
        appointment.status !== "cancelled" &&
        (appointment.professional_id
          ? appointment.professional_id === professional.id
          : appointment.professional_name === professional.name) &&
        appointment.scheduled_at.startsWith(date),
    )
    .map((appointment) => {
      const start = new Date(appointment.scheduled_at).getTime();
      return [start, start + appointment.service_duration_min * 60000];
    });

  const dayStart = new Date(`${date}T00:00:00`);
  dayStart.setHours(
    Math.floor(timeToMinutes(professional.startTime) / 60),
    timeToMinutes(professional.startTime) % 60,
    0,
    0,
  );

  const dayEnd = new Date(`${date}T00:00:00`);
  dayEnd.setHours(
    Math.floor(timeToMinutes(professional.endTime) / 60),
    timeToMinutes(professional.endTime) % 60,
    0,
    0,
  );

  const slots: string[] = [];
  for (let time = dayStart.getTime(); time + totalDuration * 60000 <= dayEnd.getTime(); time += 30 * 60000) {
    const conflict = busy.some(
      ([busyStart, busyEnd]) => !(time + totalDuration * 60000 <= busyStart || time >= busyEnd),
    );

    if (!conflict) {
      const slotDate = new Date(time);
      slots.push(minutesToTime(slotDate.getHours() * 60 + slotDate.getMinutes()));
    }
  }

  return slots;
}

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
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Scissors,
  Users2,
  X,
  XCircle,
} from "lucide-react";

import { MiniCalendar, dateToYMD } from "@/components/MiniCalendar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

type ApptStatus = "pending" | "cancelled" | "completed";

type Appt = {
  id: string;
  client_name: string;
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
  funcionario?: string | null;
  cliente?: string | null;
  servicos?: Array<{
    nome?: string | null;
    preco?: number | null;
    duracao?: number | null;
  }>;
};

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

function mapStatus(status: AgendaResponse["statusAgendamento"]): ApptStatus {
  if (status === "CANCELADO") return "cancelled";
  if (status === "FINALIZADO") return "completed";
  return "pending";
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

  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState<Date>(today);
  const [month, setMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o agendamento.");
    }
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
              onSelect={setSelected}
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
                dayAppts.map((a) => (
                  <AppointmentItem key={a.id} a={a} onUpdate={updateStatus} />
                ))
              )}
            </div>
          </div>
        </section>
      </main>
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
  onUpdate,
}: {
  a: Appt;
  onUpdate: (id: string, s: Exclude<ApptStatus, "pending">) => void;
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
            onClick={() => onUpdate(a.id, "completed")}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Finalizar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 flex-1"
            onClick={() => onUpdate(a.id, "cancelled")}
          >
            <XCircle className="mr-1.5 h-4 w-4" /> Cancelar
          </Button>
        </div>
      ) : null}
    </div>
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

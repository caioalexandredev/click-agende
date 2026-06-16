"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Loader2, Star, User2 } from "lucide-react";
import { toast } from "sonner";

import { CompanyHeader, useCompanyGuard } from "@/components/CompanyShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Review = {
  id: string;
  nota: number;
  comentario?: string | null;
  dataAvaliacao?: string | null;
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
  avaliacao?: Review | null;
  servicos?: Array<{ nome?: string | null; preco?: number | null; duracao?: number | null }>;
};

type HistoricoResponse = {
  kpis: {
    totalAgendamentos: number;
    avaliacoesRecebidas: number;
    mediaAvaliacao: number;
    qtdCincoEstrelas: number;
  };
  distribuicaoAvaliacoes: Record<string, number>;
  historicoAgendamentos: AgendaResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ProfessionalResponse = {
  id: string;
  nomeCompleto: string;
};

type Pro = {
  id: string;
  full_name: string;
};

type ApptStatus = "pending" | "cancelled" | "completed";

type Appt = {
  id: string;
  professional_id: string | null;
  professional_name: string;
  service_name: string;
  service_price: number;
  service_duration_min: number;
  client_name: string;
  scheduled_at: string;
  status: ApptStatus;
  review: Review | null;
};

type Period = "all" | "30d" | "90d" | "year";
type StatusF = "TODOS" | "AGENDADO" | "CANCELADO" | "FINALIZADO";

const PAGE_SIZE = 10;

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function brDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function brTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function mapStatus(status: string): ApptStatus {
  if (status === "CANCELADO") return "cancelled";
  if (status === "FINALIZADO") return "completed";
  return "pending";
}

function mapAppointment(agenda: AgendaResponse): Appt {
  const services = agenda.servicos ?? [];
  const price = agenda.valorTotal ?? services.reduce((total, service) => total + Number(service.preco ?? 0), 0);
  const duration = agenda.tempoAtendimento ?? services.reduce((total, service) => total + Number(service.duracao ?? 0), 0);

  return {
    id: agenda.id,
    professional_id: agenda.idFuncionario ?? null,
    professional_name: agenda.funcionario ?? "Profissional",
    service_name: services.map((service) => service.nome).filter(Boolean).join(", ") || "Serviço não informado",
    service_price: Number(price),
    service_duration_min: Number(duration),
    client_name: agenda.cliente ?? "Cliente",
    scheduled_at: agenda.dataHora,
    status: mapStatus(agenda.statusAgendamento),
    review: agenda.avaliacao ?? null,
  };
}

function periodDates(period: Period) {
  if (period === "all") return {};

  const end = new Date();
  const start = new Date(end);
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 365;
  start.setDate(start.getDate() - days);

  return { dataInicio: isoDate(start), dataFim: isoDate(end) };
}

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

export default function HistoricoContent() {
  const { company, loading } = useCompanyGuard();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [pros, setPros] = useState<Pro[]>([]);
  const [period, setPeriod] = useState<Period>("all");
  const [statusF, setStatusF] = useState<StatusF>("TODOS");
  const [proF, setProF] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [kpis, setKpis] = useState({
    totalAgendamentos: 0,
    avaliacoesRecebidas: 0,
    mediaAvaliacao: 0,
    qtdCincoEstrelas: 0,
  });
  const [distribution, setDistribution] = useState<Array<{ stars: number; count: number; pct: number }>>([]);

  const loadData = useCallback(async () => {
    setLoadingData(true);

    try {
      const params = new URLSearchParams({
        page: String(page - 1),
        size: String(PAGE_SIZE),
      });
      const dates = periodDates(period);

      if (dates.dataInicio) params.set("dataInicio", dates.dataInicio);
      if (dates.dataFim) params.set("dataFim", dates.dataFim);
      if (statusF !== "TODOS") params.set("status", statusF);
      if (proF !== "all") params.set("profissionalId", proF);

      const [historyResponse, professionalsResponse] = await Promise.all([
        fetch(`/api/empresa/historico?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/empresa/profissionais", { cache: "no-store" }),
      ]);
      const historyPayload = (await historyResponse.json().catch(() => null)) as HistoricoResponse | { message?: string } | null;
      const professionalsPayload = (await professionalsResponse.json().catch(() => null)) as ProfessionalResponse[] | { message?: string } | null;

      if (!historyResponse.ok || !historyPayload || !("historicoAgendamentos" in historyPayload)) {
        throw new Error(getMessage(historyPayload, "Não foi possível carregar o histórico."));
      }
      if (!professionalsResponse.ok || !Array.isArray(professionalsPayload)) {
        throw new Error(getMessage(professionalsPayload, "Não foi possível carregar os profissionais."));
      }

      const distributionRows = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: Number(historyPayload.distribuicaoAvaliacoes[String(stars)] ?? 0),
      }));
      const max = Math.max(1, ...distributionRows.map((row) => row.count));

      setAppts(historyPayload.historicoAgendamentos.map(mapAppointment));
      setKpis(historyPayload.kpis);
      setDistribution(distributionRows.map((row) => ({ ...row, pct: (row.count / max) * 100 })));
      setTotalItems(Number(historyPayload.totalElements ?? 0));
      setTotalPages(Math.max(1, Number(historyPayload.totalPages ?? 1)));
      setPros(professionalsPayload.map((professional) => ({ id: professional.id, full_name: professional.nomeCompleto })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o histórico.");
    } finally {
      setLoadingData(false);
    }
  }, [page, period, proF, statusF]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  const isEmpty = useMemo(() => !loadingData && appts.length === 0, [appts.length, loadingData]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <CompanyHeader businessName={company?.business_name ?? ""} />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <h1 className="font-display text-2xl font-bold">Histórico de Agendamentos</h1>
          <p className="text-sm text-muted-foreground">Visualize todos os agendamentos e avaliações recebidas</p>
        </div>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total de Agendamentos" value={String(kpis.totalAgendamentos)} />
          <Kpi label="Avaliações Recebidas" value={String(kpis.avaliacoesRecebidas)} />
          <Kpi label="Média de Avaliação" value={kpis.mediaAvaliacao.toFixed(1)} />
          <Kpi label="5 Estrelas" value={String(kpis.qtdCincoEstrelas)} />
        </section>

        <section className="mt-5 glass rounded-3xl p-5">
          <h2 className="font-display text-lg font-bold">Distribuição de Avaliações</h2>
          <div className="mt-3 space-y-2">
            {distribution.map((row) => (
              <div key={row.stars} className="grid grid-cols-[40px_1fr_40px] items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  {row.stars} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-amber-400" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="text-right text-sm font-medium">{row.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 glass rounded-3xl p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              value={period}
              onValueChange={(value) => {
                setPeriod(value as Period);
                setPage(1);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusF}
              onValueChange={(value) => {
                setStatusF(value as StatusF);
                setPage(1);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                <SelectItem value="AGENDADO">Pendente</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                <SelectItem value="FINALIZADO">Concluído</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={proF}
              onValueChange={(value) => {
                setProF(value);
                setPage(1);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {pros.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {loadingData ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}

          {isEmpty ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">Nenhum agendamento encontrado</div>
          ) : null}

          {!loadingData && appts.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}

          {!loadingData && totalItems > 0 ? (
            <HistoryPagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
          ) : null}
        </section>
      </main>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appt }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-base font-bold">{appointment.service_name}</h3>
            <StatusBadge status={appointment.status} />
          </div>
          <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="inline-flex items-center gap-1.5"><User2 className="h-3.5 w-3.5" /> {appointment.client_name}</span>
            <span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {appointment.professional_name}</span>
            <span className="inline-flex items-center gap-1.5"><CalIcon className="h-3.5 w-3.5" /> {brDate(appointment.scheduled_at)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {brTime(appointment.scheduled_at)} - {appointment.service_duration_min} min</span>
          </div>
        </div>
        <div className="shrink-0 text-right font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {brl(appointment.service_price)}
        </div>
      </div>

      {appointment.review ? (
        <div className="mt-4 rounded-2xl bg-muted/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avaliação do Cliente</p>
          <div className="mt-1 flex items-center gap-2">
            <Stars value={appointment.review.nota} />
            <span className="text-sm font-semibold">{appointment.review.nota.toFixed(1)}</span>
          </div>
          {appointment.review.comentario ? (
            <p className="mt-2 text-sm italic">“{appointment.review.comentario}”</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Appt["status"] }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    completed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  } as const;
  const label = { pending: "Pendente", cancelled: "Cancelado", completed: "Concluído" }[status];

  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>{label}</span>;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function HistoryPagination({
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
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

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

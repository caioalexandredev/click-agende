"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarCheck, Download, Loader2, Receipt, TrendingUp, XCircle } from "lucide-react";
import { toast } from "sonner";

import { CompanyHeader, useCompanyGuard } from "@/components/CompanyShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Period = "today" | "month" | "30d" | "year";

type Professional = {
  id: string;
  nomeCompleto: string;
};

type ReportResponse = {
  kpis: {
    faturamentoTotal: number;
    totalAgendamentos: number;
    agendamentosConcluidos: number;
    ticketMedio: number;
    taxaCancelamento: number;
  };
  graficos: {
    faturamentoPorDia: Array<{
      data: string;
      valorFaturado: number;
    }>;
    servicosMaisAgendados: Array<{
      nomeServico: string;
      quantidade: number;
    }>;
  };
  desempenhoProfissionais: Array<{
    profissionalId: string;
    nomeProfissional: string;
    quantidadeAgendamentos: number;
    faturamentoTotalProfissional: number;
    ticketMedioProfissional: number;
    percentualContribuicao: number;
  }>;
  message?: string;
};

const emptyReport: ReportResponse = {
  kpis: {
    faturamentoTotal: 0,
    totalAgendamentos: 0,
    agendamentosConcluidos: 0,
    ticketMedio: 0,
    taxaCancelamento: 0,
  },
  graficos: {
    faturamentoPorDia: [],
    servicosMaisAgendados: [],
  },
  desempenhoProfissionais: [],
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toLocalDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function brDay(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}`;
}

function rangeFor(period: Period) {
  const now = new Date();
  const from = new Date(now);

  if (period === "today") {
    return { dataInicio: toLocalDateInput(now), dataFim: toLocalDateInput(now) };
  }

  if (period === "month") {
    from.setDate(1);
    return { dataInicio: toLocalDateInput(from), dataFim: toLocalDateInput(now) };
  }

  if (period === "30d") {
    from.setDate(from.getDate() - 29);
    return { dataInicio: toLocalDateInput(from), dataFim: toLocalDateInput(now) };
  }

  from.setMonth(0);
  from.setDate(1);
  return { dataInicio: toLocalDateInput(from), dataFim: toLocalDateInput(now) };
}

function buildReportParams(period: Period, professionalId: string) {
  const params = new URLSearchParams(rangeFor(period));
  if (professionalId !== "all") params.set("profissionalId", professionalId);
  return params;
}

const chartAxisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};

const chartTooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  boxShadow: "0 18px 45px oklch(0 0 0 / 0.14)",
};

const chartTooltipLabelStyle = {
  color: "var(--foreground)",
  fontWeight: 700,
};

export default function RelatoriosContent() {
  const { company, loading } = useCompanyGuard();
  const [period, setPeriod] = useState<Period>("month");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [report, setReport] = useState<ReportResponse>(emptyReport);
  const [loadingData, setLoadingData] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfessionals() {
      const response = await fetch("/api/empresa/profissionais", { cache: "no-store" });
      const payload = (await response.json().catch(() => [])) as Professional[] | { message?: string };

      if (!active) return;
      if (!response.ok) {
        toast.error("Não foi possível carregar os profissionais.");
        return;
      }

      setProfessionals(Array.isArray(payload) ? payload : []);
    }

    void loadProfessionals();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      setLoadingData(true);
      const params = buildReportParams(period, professionalFilter);
      const response = await fetch(`/api/empresa/relatorios?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as ReportResponse | null;

      if (!active) return;

      if (!response.ok) {
        toast.error(payload?.message ?? "Não foi possível carregar o relatório.");
        setReport(emptyReport);
        setLoadingData(false);
        return;
      }

      setReport(payload ?? emptyReport);
      setLoadingData(false);
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [period, professionalFilter]);

  const dailyRevenue = useMemo(
    () =>
      report.graficos.faturamentoPorDia.map((item) => ({
        day: brDay(item.data),
        value: item.valorFaturado,
      })),
    [report],
  );

  const topServices = useMemo(
    () =>
      report.graficos.servicosMaisAgendados.map((item) => ({
        name: item.nomeServico,
        count: item.quantidade,
      })),
    [report],
  );

  async function exportCSV() {
    setExporting(true);
    const params = buildReportParams(period, professionalFilter);
    const response = await fetch(`/api/empresa/relatorios/exportar?${params.toString()}`);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.message ?? "Não foi possível exportar o relatório.");
      setExporting(false);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    toast.success("Relatório exportado.");
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = report.kpis;
  const proStats = report.desempenhoProfissionais;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <CompanyHeader businessName={company?.business_name ?? ""} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div>
              <h1 className="font-display text-2xl font-bold">Relatórios Financeiros</h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe o desempenho e faturamento do seu negócio
              </p>
            </div>

            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportCSV} disabled={exporting} className="gap-1.5">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar
            </Button>
          </div>

          <div className="mt-4">
            <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.nomeCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi tone="emerald" label="Faturamento Total" value={brl(kpis.faturamentoTotal)} icon={<TrendingUp className="h-5 w-5" />} />
          <Kpi tone="blue" label="Agendamentos" value={`${kpis.agendamentosConcluidos} de ${kpis.totalAgendamentos} realizados`} icon={<CalendarCheck className="h-5 w-5" />} />
          <Kpi tone="violet" label="Ticket Médio" value={brl(kpis.ticketMedio)} icon={<Receipt className="h-5 w-5" />} />
          <Kpi tone="rose" label="Taxa de Cancelamento" value={`${kpis.taxaCancelamento.toFixed(1)}%`} icon={<XCircle className="h-5 w-5" />} />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="glass rounded-3xl p-5">
            <h2 className="font-display text-lg font-bold">Faturamento por Dia</h2>
            <div className="mt-3 h-64">
              {loadingData ? <Skel /> : dailyRevenue.length === 0 ? <Empty msg="Sem dados no período" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenue}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.7} />
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: "var(--border)" }}
                      tick={chartAxisTick}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      axisLine={{ stroke: "var(--border)" }}
                      tick={chartAxisTick}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      cursor={{ stroke: "var(--primary)", strokeOpacity: 0.24 }}
                      formatter={(value) => brl(Number(value ?? 0))}
                      labelStyle={chartTooltipLabelStyle}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "var(--background)", stroke: "var(--primary)", strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <h2 className="font-display text-lg font-bold">Serviços Mais Agendados</h2>
            <div className="mt-3 h-64">
              {loadingData ? <Skel /> : topServices.length === 0 ? <Empty msg="Sem dados no período" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topServices} layout="vertical">
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.7} />
                    <XAxis
                      type="number"
                      axisLine={{ stroke: "var(--border)" }}
                      tick={chartAxisTick}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={{ stroke: "var(--border)" }}
                      tick={chartAxisTick}
                      tickLine={{ stroke: "var(--border)" }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      cursor={{ fill: "color-mix(in oklab, var(--primary) 10%, transparent)" }}
                      labelStyle={chartTooltipLabelStyle}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        <section className="glass mt-5 rounded-3xl p-5">
          <h2 className="font-display text-lg font-bold">Desempenho dos Profissionais</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Profissional</th>
                  <th className="py-2">Agendamentos</th>
                  <th className="py-2">Faturamento</th>
                  <th className="py-2">Ticket Médio</th>
                  <th className="py-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      Carregando relatório...
                    </td>
                  </tr>
                ) : proStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      Sem dados
                    </td>
                  </tr>
                ) : proStats.map((professional) => (
                  <tr key={professional.profissionalId} className="border-t border-border/40">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-gradient-primary grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-primary-foreground">
                          {professional.nomeProfissional.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium">{professional.nomeProfissional}</span>
                      </div>
                    </td>
                    <td className="py-3">{professional.quantidadeAgendamentos}</td>
                    <td className="py-3">{brl(professional.faturamentoTotalProfissional)}</td>
                    <td className="py-3">{brl(professional.ticketMedioProfissional)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                          <div
                            className="bg-gradient-primary h-full"
                            style={{ width: `${Math.min(professional.percentualContribuicao, 100).toFixed(1)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {professional.percentualContribuicao.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({
  tone,
  label,
  value,
  icon,
}: {
  tone: "emerald" | "blue" | "violet" | "rose";
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  const toneCls = {
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  }[tone];

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold leading-tight">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${toneCls}`}>{icon}</span>
      </div>
    </div>
  );
}

function Skel() {
  return (
    <div className="grid h-full place-items-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="grid h-full place-items-center text-sm text-muted-foreground">{msg}</div>;
}

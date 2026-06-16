"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Calendar as CalendarIcon, Clock, Loader2, Star, XCircle } from "lucide-react";
import { toast } from "sonner";

import { ClientHeader, useClientGuard } from "@/components/ClientShel";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Review = {
  id: string;
  nota: number;
  comentario?: string | null;
  dataAvaliacao?: string | null;
};

type AppointmentResponse = {
  id: string;
  dataHora: string;
  statusAgendamento: string;
  tempoAtendimento: number;
  valorTotal: number;
  empresa: string;
  idFuncionario?: string | null;
  funcionario: string;
  observacao?: string | null;
  avaliacao?: Review | null;
  servicos: Array<{ nome: string; preco: number; duracao: number }>;
};

type ApptStatus = "pending" | "cancelled" | "completed";

type Appt = {
  id: string;
  companyName: string;
  professionalName: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMin: number;
  scheduledAt: string;
  status: ApptStatus;
  review: Review | null;
};

type Tab = "upcoming" | "history" | "all";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function brDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function brTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function mapStatus(status: string): ApptStatus {
  if (status === "CANCELADO") return "cancelled";
  if (status === "FINALIZADO") return "completed";
  return "pending";
}

function mapAppointment(appointment: AppointmentResponse): Appt {
  return {
    id: appointment.id,
    companyName: appointment.empresa,
    professionalName: appointment.funcionario,
    serviceName: appointment.servicos.map((service) => service.nome).join(", ") || "Serviço não informado",
    servicePrice: Number(appointment.valorTotal ?? 0),
    serviceDurationMin: Number(appointment.tempoAtendimento ?? 0),
    scheduledAt: appointment.dataHora,
    status: mapStatus(appointment.statusAgendamento),
    review: appointment.avaliacao ?? null,
  };
}

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

export default function ClientAppointmentsContent() {
  const { loading } = useClientGuard();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [loadingData, setLoadingData] = useState(true);
  const [now, setNow] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Appt | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Appt | null>(null);

  async function load() {
    setLoadingData(true);
    const response = await fetch("/api/cliente/agenda", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as AppointmentResponse[] | { message?: string } | null;

    if (!response.ok || !Array.isArray(payload)) {
      toast.error(getMessage(payload, "Não foi possível carregar seus agendamentos."));
      setLoadingData(false);
      return;
    }

    setAppts(payload.map(mapAppointment));
    setLoadingData(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setNow(Date.now());
    });

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const filtered = useMemo(
    () => appts.filter((appointment) => {
      const time = new Date(appointment.scheduledAt).getTime();
      if (tab === "upcoming") return time >= now && appointment.status !== "cancelled";
      if (tab === "history") return time < now || appointment.status === "cancelled" || appointment.status === "completed";
      return true;
    }),
    [appts, now, tab],
  );

  async function confirmCancel() {
    if (!cancelTarget) return;

    const response = await fetch(`/api/cliente/agenda/${cancelTarget.id}/cancelar`, { method: "PATCH" });
    const payload = (await response.json().catch(() => null)) as AppointmentResponse | { message?: string } | null;

    if (!response.ok || !payload || !("id" in payload)) {
      toast.error(getMessage(payload, "Não foi possível cancelar o agendamento."));
      return;
    }

    setAppts((current) =>
      current.map((appointment) =>
        appointment.id === cancelTarget.id ? mapAppointment(payload) : appointment,
      ),
    );
    setCancelTarget(null);
    toast.success("Agendamento cancelado.");
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <ClientHeader />

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-12 pt-4 sm:px-6">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <h1 className="font-display text-2xl font-bold">Meus Agendamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie e avalie seus atendimentos</p>
          <div className="glass-soft mt-4 inline-flex rounded-2xl p-1">
            {([
              { key: "upcoming", label: "Próximos" },
              { key: "history", label: "Histórico" },
              { key: "all", label: "Todos" },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                  tab === item.key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-5 space-y-3">
          {loadingData ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              Nenhum agendamento {tab === "upcoming" ? "próximo" : "encontrado"}
            </div>
          ) : filtered.map((appointment) => {
            const future = new Date(appointment.scheduledAt).getTime() >= now;
            const canCancel = appointment.status === "pending" && future;
            const canReview = appointment.status === "completed" && !future && !appointment.review;

            return (
              <div key={appointment.id} className="glass rounded-3xl p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-base font-bold">{appointment.serviceName}</h3>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground/80">{appointment.companyName}</p>
                    <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" /> {appointment.professionalName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" /> {brDate(appointment.scheduledAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {brTime(appointment.scheduledAt)} - {appointment.serviceDurationMin} min
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {brl(Number(appointment.servicePrice))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {canCancel ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      onClick={() => setCancelTarget(appointment)}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" /> Cancelar
                    </Button>
                  ) : null}
                  {canReview ? (
                    <Button
                      size="sm"
                      className="bg-amber-500 text-white hover:bg-amber-600"
                      onClick={() => setReviewTarget(appointment)}
                    >
                      <Star className="mr-1.5 h-4 w-4" /> Avaliar
                    </Button>
                  ) : null}
                </div>

                {appointment.review ? (
                  <div className="mt-3 rounded-2xl bg-muted/60 p-3">
                    <div className="flex items-center gap-2">
                      <Stars value={appointment.review.nota} />
                      <span className="text-sm font-semibold">Sua avaliação</span>
                    </div>
                    {appointment.review.comentario ? (
                      <p className="mt-1 text-sm italic">“{appointment.review.comentario}”</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      </main>

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será marcado como cancelado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-rose-600 hover:bg-rose-700">
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReviewModal
        key={reviewTarget?.id ?? "review-modal"}
        target={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSaved={(updatedAppointment) => {
          setReviewTarget(null);
          setAppts((current) =>
            current.map((appointment) =>
              appointment.id === updatedAppointment.id ? mapAppointment(updatedAppointment) : appointment,
            ),
          );
        }}
      />
    </div>
  );
}

function ReviewModal({
  target,
  onClose,
  onSaved,
}: {
  target: Appt | null;
  onClose: () => void;
  onSaved: (appointment: AppointmentResponse) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!target || rating === 0) return;

    setBusy(true);
    const response = await fetch(`/api/cliente/agenda/${target.id}/avaliar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nota: rating,
        comentario: comment.trim() || null,
      }),
    });
    const payload = (await response.json().catch(() => null)) as AppointmentResponse | { message?: string } | null;
    setBusy(false);

    if (!response.ok || !payload || !("id" in payload)) {
      toast.error(getMessage(payload, "Não foi possível enviar a avaliação."));
      return;
    }

    toast.success("Avaliação enviada.");
    onSaved(payload);
  }

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar Atendimento</DialogTitle>
          <DialogDescription>Como foi sua experiência?</DialogDescription>
        </DialogHeader>
        <div className="grid justify-items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)} className="p-1">
                <Star
                  className={`h-8 w-8 transition ${
                    value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Conte-nos sobre sua experiência..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            maxLength={500}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={rating === 0 || busy} className="bg-gradient-primary">
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Enviar Avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

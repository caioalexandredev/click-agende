"use client";

import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ImageOff,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Store,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/ThemeToggle";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AddressResponse = {
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
};

type CompanyResponse = {
  id: string;
  nome: string;
  descricao?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: AddressResponse | null;
};

type ServiceResponse = {
  id: number;
  urlImagem?: string | null;
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
  disponivel?: boolean | null;
};

type ProfessionalResponse = {
  id: string;
  nomeCompleto: string;
  especialidade?: string | null;
  urlImagem?: string | null;
  biografia?: string | null;
  horarioInicio: string;
  horarioFim: string;
  disponivel?: boolean | null;
  servicos?: ServiceResponse[] | null;
};

type AppointmentResponse = {
  id: string;
  dataHora: string;
  statusAgendamento: string;
  tempoAtendimento: number;
  valorTotal: number;
  empresa: string;
  funcionario: string;
  servicos: { id: number; nome: string; preco: number; duracao: number }[];
};

type Company = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  uf: string;
  phone: string;
  email: string;
};

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  imageUrl: string;
};

type Professional = {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  bio: string;
  startTime: string;
  endTime: string;
  serviceIds: number[];
};

type AppointmentStatus = "pending" | "cancelled" | "completed";

type Appointment = {
  id: string;
  status: AppointmentStatus;
  scheduledAt: string;
  professionalName: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMin: number;
};

type EstablishmentContentProps = {
  companyId: string;
};

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string") return message;
  }

  return fallback;
}

function mapCompany(company: CompanyResponse): Company {
  return {
    id: company.id,
    name: company.nome,
    description: company.descricao || "Estabelecimento disponível para agendamentos.",
    address: company.endereco?.endereco || "Endereço não informado",
    city: company.endereco?.cidade || "",
    uf: company.endereco?.uf || "",
    phone: company.telefone || "Telefone não informado",
    email: company.email || "Email não informado",
  };
}

function mapService(service: ServiceResponse): Service {
  return {
    id: service.id,
    name: service.nome,
    description: service.descricao || "",
    price: Number(service.preco ?? 0),
    durationMin: Number(service.duracao ?? 0),
    imageUrl: service.urlImagem || "",
  };
}

function mapProfessional(professional: ProfessionalResponse): Professional {
  return {
    id: professional.id,
    name: professional.nomeCompleto,
    specialty: professional.especialidade || "Profissional",
    imageUrl: professional.urlImagem || "",
    bio: professional.biografia || "",
    startTime: professional.horarioInicio?.slice(0, 5) || "08:00",
    endTime: professional.horarioFim?.slice(0, 5) || "18:00",
    serviceIds: professional.servicos?.map((service) => service.id) ?? [],
  };
}

function mapAppointment(appointment: AppointmentResponse): Appointment {
  return {
    id: appointment.id,
    status: mapStatus(appointment.statusAgendamento),
    scheduledAt: appointment.dataHora,
    professionalName: appointment.funcionario,
    serviceName: appointment.servicos.map((service) => service.nome).join(", "),
    servicePrice: Number(appointment.valorTotal ?? 0),
    serviceDurationMin: Number(appointment.tempoAtendimento ?? 0),
  };
}

function mapStatus(status: string): AppointmentStatus {
  if (status === "CANCELADO") return "cancelled";
  if (status === "FINALIZADO") return "completed";
  return "pending";
}

function statusLabel(status: AppointmentStatus) {
  if (status === "cancelled") return "Cancelado";
  if (status === "completed") return "Finalizado";
  return "Agendado";
}

function statusBadgeClassName(status: AppointmentStatus) {
  if (status === "cancelled") {
    return "border-destructive/25 bg-destructive/10 text-destructive";
  }

  if (status === "completed") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "border-primary/25 bg-primary/10 text-primary";
}

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function brDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function EstablishmentContent({ companyId }: EstablishmentContentProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEstablishment() {
      setLoading(true);
      setError("");

      try {
        const [companyResponse, servicesResponse, professionalsResponse, appointmentsResponse] =
          await Promise.all([
            fetch(`/api/cliente/empresas/${companyId}`),
            fetch(`/api/cliente/empresas/${companyId}/servicos`),
            fetch(`/api/cliente/empresas/${companyId}/profissionais`),
            fetch("/api/cliente/agenda"),
          ]);

        const companyPayload = (await companyResponse.json().catch(() => null)) as
          | CompanyResponse
          | { message?: string }
          | null;
        const servicesPayload = (await servicesResponse.json().catch(() => null)) as
          | ServiceResponse[]
          | { message?: string }
          | null;
        const professionalsPayload = (await professionalsResponse.json().catch(() => null)) as
          | ProfessionalResponse[]
          | { message?: string }
          | null;
        const appointmentsPayload = (await appointmentsResponse.json().catch(() => null)) as
          | AppointmentResponse[]
          | { message?: string }
          | null;

        if (
          companyResponse.status === 401 ||
          servicesResponse.status === 401 ||
          professionalsResponse.status === 401 ||
          appointmentsResponse.status === 401
        ) {
          router.push("/cliente/login");
          return;
        }

        if (!companyResponse.ok) {
          throw new Error(getMessage(companyPayload, "Não foi possível carregar o estabelecimento."));
        }

        if (!servicesResponse.ok || !Array.isArray(servicesPayload)) {
          throw new Error(getMessage(servicesPayload, "Não foi possível carregar os serviços."));
        }

        if (!professionalsResponse.ok || !Array.isArray(professionalsPayload)) {
          throw new Error(getMessage(professionalsPayload, "Não foi possível carregar os profissionais."));
        }

        if (!appointmentsResponse.ok || !Array.isArray(appointmentsPayload)) {
          throw new Error(getMessage(appointmentsPayload, "Não foi possível carregar seus agendamentos."));
        }

        if (!active || !companyPayload || !("id" in companyPayload)) return;

        const mappedCompany = mapCompany(companyPayload);
        setCompany(mappedCompany);
        setServices(servicesPayload.map(mapService));
        setProfessionals(professionalsPayload.map(mapProfessional));
        setAppointments(
          appointmentsPayload
            .filter((appointment) => appointment.empresa === mappedCompany.name)
            .map(mapAppointment),
        );
      } catch (requestError) {
        if (!active) return;

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar a página do estabelecimento.";

        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEstablishment();

    return () => {
      active = false;
    };
  }, [companyId, router]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/cliente/login");
  }

  async function cancelAppointment() {
    if (!cancelTarget) return;

    setCancelingId(cancelTarget.id);

    try {
      const response = await fetch(`/api/cliente/agenda/${cancelTarget.id}/cancelar`, {
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => null)) as
        | AppointmentResponse
        | { message?: string }
        | null;

      if (!response.ok || !payload || !("id" in payload)) {
        throw new Error(getMessage(payload, "Não foi possível cancelar o agendamento."));
      }

      const updatedAppointment = mapAppointment(payload);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment,
        ),
      );
      setCancelTarget(null);
      toast.success("Agendamento cancelado.");
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Não foi possível cancelar o agendamento.";
      toast.error(message);
    } finally {
      setCancelingId(null);
    }
  }

  const upcoming = appointments.filter((appointment) => appointment.status === "pending");
  const history = appointments.filter((appointment) => appointment.status !== "pending");

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <p className="text-muted-foreground">{error || "Estabelecimento não encontrado."}</p>
          <Link href="/cliente" className="mt-3 inline-block text-primary underline">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-primary grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-lg">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold">ClickAgende</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/cliente"
            className="glass-soft inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Trocar estabelecimento
          </Link>
          <Button className="bg-gradient-primary gap-1.5" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>
          <Button variant="ghost" onClick={signOut} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-12">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{company.name}</h1>
          <p className="mt-1 text-muted-foreground">Escolha um serviço e agende seu horário.</p>
        </div>

        <Section title="Sobre o estabelecimento">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard
              icon={<MapPin className="h-4 w-4" />}
              label="Endereço"
              value={`${company.address}${company.city ? `, ${company.city}` : ""}${company.uf ? ` - ${company.uf}` : ""}`}
            />
            <InfoCard icon={<Phone className="h-4 w-4" />} label="Telefone" value={company.phone} />
            <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={company.email} />
          </div>
          {company.description ? (
            <div className="glass-soft mt-3 rounded-2xl p-4 text-sm text-muted-foreground">
              {company.description}
            </div>
          ) : null}
        </Section>

        <Section title="Serviços disponíveis">
          {services.length === 0 ? (
            <Empty msg="Este estabelecimento ainda não possui serviços disponíveis." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <PublicServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </Section>

        <Section title="Profissionais">
          {professionals.length === 0 ? (
            <Empty msg="Nenhum profissional disponível." />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {professionals.map((professional) => (
                <li key={professional.id} className="glass-soft flex items-center gap-3 rounded-2xl p-4">
                  {professional.imageUrl ? (
                    <div
                      role="img"
                      aria-label={professional.name}
                      className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${professional.imageUrl})` }}
                    />
                  ) : (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <User2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">{professional.name}</p>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {professional.startTime} - {professional.endTime}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Próximos agendamentos">
          {upcoming.length === 0 ? (
            <Empty msg="Nenhum agendamento próximo neste estabelecimento." />
          ) : (
            <ApptList items={upcoming} cancelingId={cancelingId} onCancel={setCancelTarget} />
          )}
        </Section>

        <Section title="Histórico">
          {history.length === 0 ? <Empty msg="Sem agendamentos no histórico deste estabelecimento." /> : <ApptList items={history} />}
        </Section>
      </main>

      <BookingModal
        companyId={company.id}
        open={modalOpen}
        onOpenChange={setModalOpen}
        services={services}
        professionals={professionals}
        appointments={appointments}
        onCreated={(appointment) => {
          setModalOpen(false);
          setAppointments((current) => [appointment, ...current]);
        }}
      />

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação vai cancelar o agendamento de {cancelTarget?.serviceName} em{" "}
              {cancelTarget ? brDateTime(cancelTarget.scheduledAt) : ""}. O horário poderá ficar
              disponível novamente para outros clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(cancelingId)}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(cancelingId)}
              onClick={(event) => {
                event.preventDefault();
                cancelAppointment();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelingId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-soft rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="glass-soft grid place-items-center rounded-2xl p-6 text-center text-sm text-muted-foreground">
      <Store className="mb-2 h-6 w-6" />
      {msg}
    </div>
  );
}

function PublicServiceCard({ service }: { service: Service }) {
  return (
    <div className="glass-soft overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] bg-muted">
        {service.imageUrl ? (
          <div
            role="img"
            aria-label={service.name}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${service.imageUrl})` }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-7 w-7" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{service.name}</h3>
        {service.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>
        ) : null}
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{service.durationMin} min</span>
          <span className="font-bold text-primary">{brl(service.price)}</span>
        </div>
      </div>
    </div>
  );
}

function ApptList({
  items,
  cancelingId,
  onCancel,
}: {
  items: Appointment[];
  cancelingId?: string | null;
  onCancel?: (appointment: Appointment) => void;
}) {
  return (
    <ul className="grid gap-3">
      {items.map((appointment) => (
        <li
          key={appointment.id}
          className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
        >
          <div className="min-w-0">
            <p className="font-semibold">{appointment.serviceName}</p>
            <p className="text-xs text-muted-foreground">
              {appointment.professionalName} • {appointment.serviceDurationMin} min
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-sm font-semibold">{brDateTime(appointment.scheduledAt)}</p>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClassName(appointment.status)}`}
            >
              {statusLabel(appointment.status)}
            </span>
            {onCancel && appointment.status === "pending" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cancelingId === appointment.id}
                onClick={() => onCancel(appointment)}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {cancelingId === appointment.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Cancelar
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function BookingModal({
  companyId,
  open,
  onOpenChange,
  services,
  professionals,
  appointments,
  onCreated,
}: {
  companyId: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  onCreated: (appointment: Appointment) => void;
}) {
  const [professionalId, setProfessionalId] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const professional = professionals.find((item) => item.id === professionalId);
  const selectedServiceItems = services.filter((service) => selectedServices.has(service.id));
  const totalDuration = selectedServiceItems.reduce((acc, service) => acc + service.durationMin, 0);
  const totalPrice = selectedServiceItems.reduce((acc, service) => acc + service.price, 0);
  const slots = buildSlots({
    professional,
    date,
    selectedServices: selectedServiceItems,
    appointments,
  });
  const count = selectedServices.size;
  const shouldShowNoSlots = Boolean(professionalId && date && count > 0 && slots.length === 0);

  function close(openNext: boolean) {
    onOpenChange(openNext);
    if (!openNext) {
      setProfessionalId("");
      setSelectedServices(new Set());
      setDate("");
      setTime("");
    }
  }

  function changeProfessional(value: string) {
    const nextProfessional = professionals.find((item) => item.id === value);
    setProfessionalId(value);
    setTime("");

    if (!nextProfessional) {
      setSelectedServices(new Set());
      return;
    }

    setSelectedServices((current) => {
      const next = new Set<number>();
      current.forEach((serviceId) => {
        if (nextProfessional.serviceIds.includes(serviceId)) next.add(serviceId);
      });
      return next;
    });
  }

  function toggleService(serviceId: number, checked: boolean) {
    setSelectedServices((current) => {
      const next = new Set(current);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
    setTime("");
  }

  async function submit() {
    if (!professional) {
      toast.error("Selecione um profissional.");
      return;
    }

    if (selectedServices.size === 0) {
      toast.error("Selecione ao menos um serviço.");
      return;
    }

    if (!date) {
      toast.error("Selecione uma data.");
      return;
    }

    if (!time || !slots.includes(time)) {
      toast.error("Selecione um horário disponível.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/cliente/agenda", {
        method: "POST",
        body: JSON.stringify({
          idEmpresa: companyId,
          idFuncionario: professional.id,
          dataHoraAgendamento: `${date}T${time}:00`,
          servicos: Array.from(selectedServices),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | AppointmentResponse
        | { message?: string }
        | null;

      if (!response.ok || !payload || !("id" in payload)) {
        throw new Error(getMessage(payload, "Não foi possível criar o agendamento."));
      }

      toast.success("Agendamento criado!");
      onCreated(mapAppointment(payload));
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Não foi possível criar o agendamento.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Profissional</Label>
            <Select value={professionalId} onValueChange={changeProfessional}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium">Serviços</Label>
            <div className="glass-soft max-h-48 overflow-auto rounded-2xl p-2">
              {services.length === 0 ? (
                <p className="p-2 text-xs text-muted-foreground">Sem serviços disponíveis.</p>
              ) : (
                services.map((service) => {
                  const checked = selectedServices.has(service.id);
                  const disabled = Boolean(professional && !professional.serviceIds.includes(service.id));

                  return (
                    <label
                      key={service.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-primary/5"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(value) => toggleService(service.id, Boolean(value))}
                      />
                      <span className="flex-1 text-sm">{service.name}</span>
                      <span className="text-xs text-muted-foreground">{service.durationMin}min</span>
                      <span className="text-sm font-semibold">{brl(service.price)}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Data</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => {
                  setDate(event.target.value);
                  setTime("");
                }}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Horário</Label>
              <Select
                value={time}
                onValueChange={setTime}
                disabled={!professionalId || !date || shouldShowNoSlots}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !professionalId || !date
                        ? "Selecione profissional e data"
                        : slots.length === 0
                          ? "Nenhum horário disponível"
                          : "Selecione um horário"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {shouldShowNoSlots ? (
              <div className="col-span-2 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-5">
                  Não há horários disponíveis para esse profissional, data e duração dos serviços.
                </p>
              </div>
            ) : null}
          </div>

          {count > 0 ? (
            <div className="glass-soft rounded-2xl p-3 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Duração total</span>
                <span className="font-semibold">{totalDuration} min</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">{brl(totalPrice)}</span>
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={saving || count === 0 || !time}
            className="bg-gradient-primary w-full sm:w-auto"
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}
            Agendar ({count} {count === 1 ? "serviço" : "serviços"})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildSlots({
  professional,
  date,
  selectedServices,
  appointments,
}: {
  professional?: Professional;
  date: string;
  selectedServices: Service[];
  appointments: Appointment[];
}) {
  if (!professional || !date) return [];

  const totalDuration = selectedServices.reduce((acc, service) => acc + service.durationMin, 0) || 30;
  const busy = appointments
    .filter(
      (appointment) =>
        appointment.status !== "cancelled" &&
        appointment.professionalName === professional.name &&
        appointment.scheduledAt.startsWith(date),
    )
    .map((appointment) => {
      const start = new Date(appointment.scheduledAt).getTime();
      return [start, start + appointment.serviceDurationMin * 60000];
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

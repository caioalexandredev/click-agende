"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LogOut, CalendarCheck, ArrowLeft, MapPin, Phone, Mail, Plus, Loader2,
  User2, Clock, Store, ImageOff, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Company = {
  id: string; business_name: string; description: string | null;
  address: string; city: string | null; uf: string | null; phone: string; email: string | null;
};
type Service = { id: string; name: string; description: string | null; price: number; duration_min: number; image_url: string | null };
type Pro = { id: string; full_name: string; specialty: string; start_time: string; end_time: string; service_ids: string[] };
type Appt = {
  id: string; status: "pending" | "confirmed" | "cancelled" | "completed";
  scheduled_at: string; professional_name: string; service_name: string;
  service_price: number; service_duration_min: number;
};

const MOCK_CLIENT = { id: "client-1", full_name: "Caio Ramos" };

const MOCK_COMPANIES: Company[] = [
  {
    id: "clickagende-studio",
    business_name: "ClickAgende Studio",
    description: "Estúdio especializado em beleza, bem-estar e atendimento com hora marcada.",
    address: "Rua das Flores, 120",
    city: "Palmas",
    uf: "TO",
    phone: "(63) 3456-7890",
    email: "contato@clickagende.com",
  },
  {
    id: "barbearia-central",
    business_name: "Barbearia Central",
    description: "Cortes masculinos, barba completa e acabamento com atendimento pontual.",
    address: "Avenida JK, 845",
    city: "Palmas",
    uf: "TO",
    phone: "(63) 99988-1020",
    email: "agenda@barbeariacentral.com",
  },
];

const MOCK_SERVICES: Record<string, Service[]> = {
  "clickagende-studio": [
    {
      id: "srv-1",
      name: "Corte feminino",
      description: "Corte personalizado com finalização simples.",
      price: 85,
      duration_min: 60,
      image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "srv-2",
      name: "Barba completa",
      description: "Modelagem, toalha quente e acabamento com navalha.",
      price: 45,
      duration_min: 35,
      image_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "srv-3",
      name: "Manicure tradicional",
      description: "Cutilagem, esmaltação e hidratação rápida.",
      price: 38,
      duration_min: 50,
      image_url: null,
    },
  ],
  "barbearia-central": [
    {
      id: "srv-4",
      name: "Corte masculino",
      description: "Corte clássico ou degradê com acabamento.",
      price: 50,
      duration_min: 40,
      image_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
    },
  ],
};

const MOCK_PROS: Record<string, Pro[]> = {
  "clickagende-studio": [
    { id: "pro-1", full_name: "Ana Beatriz Souza", specialty: "Cabeleireira", start_time: "08:00", end_time: "17:00", service_ids: ["srv-1"] },
    { id: "pro-2", full_name: "Marcos Vinícius Lima", specialty: "Barbeiro", start_time: "09:00", end_time: "19:00", service_ids: ["srv-2"] },
    { id: "pro-3", full_name: "Juliana Carvalho", specialty: "Manicure", start_time: "08:30", end_time: "16:30", service_ids: ["srv-3"] },
  ],
  "barbearia-central": [
    { id: "pro-4", full_name: "Rafael Almeida", specialty: "Barbeiro", start_time: "09:00", end_time: "18:00", service_ids: ["srv-4"] },
  ],
};

const MOCK_APPTS: Record<string, Appt[]> = {
  "clickagende-studio": [
    {
      id: "appt-1",
      status: "confirmed",
      scheduled_at: "2026-06-18T14:00:00",
      professional_name: "Ana Beatriz Souza",
      service_name: "Corte feminino",
      service_price: 85,
      service_duration_min: 60,
    },
    {
      id: "appt-2",
      status: "completed",
      scheduled_at: "2026-06-03T10:00:00",
      professional_name: "Marcos Vinícius Lima",
      service_name: "Barba completa",
      service_price: 45,
      service_duration_min: 35,
    },
  ],
};

function getInitialCompanyId() {
  if (typeof window === "undefined") return "clickagende-studio";

  const search = new URLSearchParams(window.location.search);
  const fromQuery = search.get("empresa");
  if (fromQuery && MOCK_COMPANIES.some((company) => company.id === fromQuery)) return fromQuery;

  const lastSegment = window.location.pathname.split("/").filter(Boolean).at(-1);
  return lastSegment && MOCK_COMPANIES.some((company) => company.id === lastSegment)
    ? lastSegment
    : "clickagende-studio";
}

function brl(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function brDateTime(iso: string) { return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); }
function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function EstablishmentContent() {
  const router = useRouter();
  const companyId = getInitialCompanyId();
  const company = MOCK_COMPANIES.find((item) => item.id === companyId) ?? null;
  const services = company ? (MOCK_SERVICES[company.id] ?? []) : [];
  const pros = company ? (MOCK_PROS[company.id] ?? []) : [];
  const [clientId] = useState<string | null>(MOCK_CLIENT.id);
  const [clientName] = useState(MOCK_CLIENT.full_name);
  const [myAppts, setMyAppts] = useState<Appt[]>(company ? (MOCK_APPTS[company.id] ?? []) : []);
  const [loading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/cliente/login");
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!company) return (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="text-muted-foreground">Estabelecimento não encontrado.</p>
        <Link href="/cliente" className="mt-3 inline-block text-primary underline">Voltar</Link>
      </div>
    </div>
  );

  const upcoming = myAppts.filter((a) => a.status === "pending" || a.status === "confirmed");
  const history = myAppts.filter((a) => a.status === "completed" || a.status === "cancelled");

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
          <Link href="/cliente"
            className="glass-soft inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" /> Trocar estabelecimento
          </Link>
          <Button className="bg-gradient-primary gap-1.5" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Novo Agendamento
          </Button>
          <Button variant="ghost" onClick={signOut} className="gap-1.5"><LogOut className="h-4 w-4" /> Sair</Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-12">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{company.business_name}</h1>
          <p className="mt-1 text-muted-foreground">Olá, {clientName || "cliente"}! Escolha um serviço e agende agora.</p>
        </div>

        {/* Sobre */}
        <Section title="Sobre o Estabelecimento">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard icon={<MapPin className="h-4 w-4" />} label="Endereço"
              value={`${company.address}${company.city ? `, ${company.city}` : ""}${company.uf ? ` - ${company.uf}` : ""}`} />
            <InfoCard icon={<Phone className="h-4 w-4" />} label="Telefone" value={company.phone} />
            <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={company.email ?? "-"} />
          </div>
          {company.description ? (
            <div className="glass-soft mt-3 rounded-2xl p-4 text-sm text-muted-foreground">{company.description}</div>
          ) : null}
        </Section>

        {/* Serviços */}
        <Section title="Serviços Disponíveis">
          {services.length === 0 ? (
            <Empty msg="Este estabelecimento ainda não cadastrou serviços." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => <PublicServiceCard key={s.id} s={s} />)}
            </div>
          )}
        </Section>

        {/* Profissionais */}
        <Section title="Nossos Profissionais">
          {pros.length === 0 ? (
            <Empty msg="Nenhum profissional cadastrado." />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {pros.map((p) => (
                <li key={p.id} className="glass-soft flex items-center gap-3 rounded-2xl p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><User2 className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="font-semibold">{p.full_name}</p>
                    <p className="text-sm text-muted-foreground">{p.specialty}</p>
                    <p className="text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{p.start_time.slice(0, 5)} - {p.end_time.slice(0, 5)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Próximos */}
        <Section title="Próximos Agendamentos">
          {upcoming.length === 0 ? <Empty msg="Nenhum agendamento próximo." /> : <ApptList items={upcoming} />}
        </Section>

        {/* Histórico */}
        <Section title="Histórico">
          {history.length === 0 ? <Empty msg="Sem agendamentos no histórico." /> : <ApptList items={history} />}
        </Section>
      </main>

      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        services={services}
        pros={pros}
        clientId={clientId}
        appointments={myAppts}
        onCreated={(appt) => {
          setModalOpen(false);
          setMyAppts((current) => [appt, ...current]);
        }}
      />
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
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">{icon}{label}</div>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="glass-soft grid place-items-center rounded-2xl p-6 text-center text-sm text-muted-foreground"><Store className="mb-2 h-6 w-6" />{msg}</div>;
}

function PublicServiceCard({ s }: { s: Service }) {
  const [err, setErr] = useState(false);
  return (
    <div className="glass-soft overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] bg-muted">
        {s.image_url && !err ? (
          <div
            role="img"
            aria-label={s.name}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${s.image_url})` }}
            onError={() => setErr(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageOff className="h-7 w-7" /></div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{s.name}</h3>
        {s.description ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p> : null}
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{s.duration_min} min</span>
          <span className="font-bold text-primary">{brl(Number(s.price))}</span>
        </div>
      </div>
    </div>
  );
}

function ApptList({ items }: { items: Appt[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((a) => (
        <li key={a.id} className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <div className="min-w-0">
            <p className="font-semibold">{a.service_name}</p>
            <p className="text-xs text-muted-foreground">{a.professional_name} • {a.service_duration_min} min</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{brDateTime(a.scheduled_at)}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{a.status}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------- Booking Modal ----------
function BookingModal({
  open, onOpenChange, services, pros, clientId, appointments, onCreated,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  services: Service[]; pros: Pro[];
  clientId: string | null; appointments: Appt[];
  onCreated: (appt: Appt) => void;
}) {
  const [proId, setProId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  function close(openNext: boolean) {
    onOpenChange(openNext);
    if (!openNext) {
      setProId("");
      setSelected(new Set());
      setDate("");
      setTime("");
    }
  }

  const selectedServices = services.filter((service) => selected.has(service.id));
  const totalDur = selectedServices.reduce((acc, service) => acc + service.duration_min, 0);
  const totalPrice = selectedServices.reduce((acc, service) => acc + Number(service.price), 0);
  const slots = buildSlots({ proId, date, selectedServices, pros, appointments });
  const count = selected.size;
  const btnLabel = `Agendar (${count} ${count === 1 ? "serviço" : "serviços"})`;

  function toggleService(serviceId: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
    setTime("");
  }

  function changePro(value: string) {
    setProId(value);
    setTime("");
  }

  function changeDate(value: string) {
    setDate(value);
    setTime("");
  }

  function submit() {
    if (!clientId) return;
    if (!proId) return toast.error("Selecione um profissional.");
    if (selected.size === 0) return toast.error("Selecione ao menos um serviço.");
    if (!date) return toast.error("Selecione uma data.");
    if (!time || !slots.includes(time)) return toast.error("Selecione um horário disponível.");
    const pro = pros.find((p) => p.id === proId);
    if (!pro) return toast.error("Profissional inválido.");
    const scheduled = new Date(`${date}T${time}:00`).toISOString();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Agendamento criado!");
      onCreated({
        id: `appt-${Date.now()}`,
        status: "pending",
        scheduled_at: scheduled,
        professional_name: pro.full_name,
        service_name: selectedServices.map((s) => s.name).join(", "),
        service_price: totalPrice,
        service_duration_min: totalDur,
      });
    }, 400);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Profissional</Label>
            <Select value={proId} onValueChange={changePro}>
              <SelectTrigger><SelectValue placeholder="Selecione um profissional" /></SelectTrigger>
              <SelectContent>
                {pros.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name} - {p.specialty}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium">Serviços</Label>
            <div className="glass-soft max-h-48 overflow-auto rounded-2xl p-2">
              {services.length === 0 ? (
                <p className="p-2 text-xs text-muted-foreground">Sem serviços disponíveis.</p>
              ) : services.map((s) => {
                const checked = selected.has(s.id);
                const pro = pros.find((p) => p.id === proId);
                const disabled = Boolean(pro && !pro.service_ids.includes(s.id));
                return (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-primary/5">
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(v) => toggleService(s.id, Boolean(v))}
                    />
                    <span className="flex-1 text-sm">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.duration_min}min</span>
                    <span className="text-sm font-semibold">{brl(Number(s.price))}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Data</Label>
              <Input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => changeDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Horário</Label>
              <Select value={time} onValueChange={setTime} disabled={!proId || !date}>
                <SelectTrigger>
                  <SelectValue placeholder={!proId || !date ? "Selecione profissional e data" : slots.length === 0 ? "Nenhum horário disponível" : "Selecione um horário"} />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {count > 0 ? (
            <div className="glass-soft rounded-2xl p-3 text-sm">
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Duração total</span><span className="font-semibold">{totalDur} min</span></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">{brl(totalPrice)}</span></p>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving || count === 0 || !time} className="bg-gradient-primary w-full sm:w-auto">
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />} {btnLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildSlots({
  proId,
  date,
  selectedServices,
  pros,
  appointments,
}: {
  proId: string;
  date: string;
  selectedServices: Service[];
  pros: Pro[];
  appointments: Appt[];
}) {
  if (!proId || !date) return [];
  const pro = pros.find((p) => p.id === proId);
  if (!pro) return [];

  const totalDur = selectedServices.reduce((acc, service) => acc + service.duration_min, 0) || 30;
  const busy = appointments
    .filter((appt) => appt.status !== "cancelled" && appt.scheduled_at.startsWith(date))
    .map((appt) => {
      const start = new Date(appt.scheduled_at).getTime();
      return [start, start + appt.service_duration_min * 60000];
    });

  const dayStart = new Date(`${date}T00:00:00`);
  dayStart.setHours(Math.floor(timeToMinutes(pro.start_time) / 60), timeToMinutes(pro.start_time) % 60, 0, 0);
  const dayEnd = new Date(`${date}T00:00:00`);
  dayEnd.setHours(Math.floor(timeToMinutes(pro.end_time) / 60), timeToMinutes(pro.end_time) % 60, 0, 0);

  const out: string[] = [];
  for (let t = dayStart.getTime(); t + totalDur * 60000 <= dayEnd.getTime(); t += 30 * 60000) {
    const conflict = busy.some(([busyStart, busyEnd]) => !(t + totalDur * 60000 <= busyStart || t >= busyEnd));
    if (!conflict) out.push(minutesToTime(new Date(t).getHours() * 60 + new Date(t).getMinutes()));
  }
  return out;
}

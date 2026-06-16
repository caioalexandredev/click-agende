"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { ClientHeader, useClientGuard } from "@/components/ClientShel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Method = "EMAIL" | "WHATSAPP";

type NotificationConfig = {
  receberNotificacoes: boolean;
  configuracaoInicialConcluida: boolean;
  metodoPreferencial?: Method | null;
  emailNotificacao?: string | null;
  whatsappNotificacao?: string | null;
};

type ClientResponse = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: {
    cep: string;
    endereco: string;
    idCidade: number;
  };
  notificacaoConfig?: NotificationConfig | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

export default function ClientSettingsContent() {
  const { loading } = useClientGuard();
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [method, setMethod] = useState<Method | null>(null);
  const [notifEmail, setNotifEmail] = useState("");
  const [notifWhatsapp, setNotifWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadClient() {
      setLoadingData(true);

      try {
        const response = await fetch("/api/cliente/me", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as ClientResponse | { message?: string } | null;

        if (!response.ok || !payload || !("id" in payload)) {
          throw new Error(getMessage(payload, "Não foi possível carregar os dados do cliente."));
        }

        if (!active) return;

        const config = payload.notificacaoConfig;
        setClient(payload);
        setFullName(payload.nomeCompleto ?? "");
        setEmail(payload.email ?? "");
        setPhone(payload.telefone ?? "");
        setNotifEnabled(Boolean(config?.receberNotificacoes));
        setMethod(config?.metodoPreferencial ?? null);
        setNotifEmail(config?.emailNotificacao ?? payload.email ?? "");
        setNotifWhatsapp(config?.whatsappNotificacao ?? payload.telefone ?? "");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível carregar os dados do cliente.");
      } finally {
        if (active) setLoadingData(false);
      }
    }

    queueMicrotask(() => {
      void loadClient();
    });

    return () => {
      active = false;
    };
  }, []);

  async function save(options?: {
    initialConfigDone?: boolean;
    closeWelcome?: boolean;
    notificationOverride?: {
      enabled: boolean;
      method: Method | null;
      email: string;
      whatsapp: string;
    };
  }) {
    if (!client) return false;
    const notification = options?.notificationOverride ?? {
      enabled: notifEnabled,
      method,
      email: notifEmail,
      whatsapp: notifWhatsapp,
    };

    if (!fullName.trim()) {
      toast.error("Nome completo é obrigatório.");
      return false;
    }

    if (!isEmail(email)) {
      toast.error("E-mail inválido.");
      return false;
    }

    if (notification.enabled) {
      if (!notification.method) {
        toast.error("Selecione um método de notificação.");
        return false;
      }

      if (notification.method === "EMAIL" && !isEmail(notification.email)) {
        toast.error("E-mail para notificação inválido.");
        return false;
      }

      if (notification.method === "WHATSAPP" && onlyDigits(notification.whatsapp).length < 10) {
        toast.error("Número do WhatsApp inválido.");
        return false;
      }
    }

    setSaving(true);
    const notificacaoConfig: NotificationConfig = {
      receberNotificacoes: notification.enabled,
      configuracaoInicialConcluida: options?.initialConfigDone ?? client.notificacaoConfig?.configuracaoInicialConcluida ?? false,
      metodoPreferencial: notification.enabled ? notification.method : null,
      emailNotificacao: notification.enabled && notification.method === "EMAIL" ? notification.email.trim() : null,
      whatsappNotificacao: notification.enabled && notification.method === "WHATSAPP" ? notification.whatsapp.trim() : null,
    };

    const response = await fetch("/api/cliente/me", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nomeCompleto: fullName.trim(),
        telefone: phone.trim(),
        email: email.trim(),
        endereco: {
          cep: client.endereco.cep,
          endereco: client.endereco.endereco,
          idCidade: client.endereco.idCidade,
        },
        notificacaoConfig,
      }),
    });
    const payload = (await response.json().catch(() => null)) as ClientResponse | { message?: string } | null;
    setSaving(false);

    if (!response.ok || !payload || !("id" in payload)) {
      toast.error(getMessage(payload, "Não foi possível salvar as alterações."));
      return false;
    }

    setClient(payload);
    setNotifEnabled(Boolean(payload.notificacaoConfig?.receberNotificacoes));
    setMethod(payload.notificacaoConfig?.metodoPreferencial ?? null);
    setNotifEmail(payload.notificacaoConfig?.emailNotificacao ?? payload.email ?? "");
    setNotifWhatsapp(payload.notificacaoConfig?.whatsappNotificacao ?? payload.telefone ?? "");
    toast.success("Alterações salvas.");
    return true;
  }

  if (loading || loadingData) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <ClientHeader />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-12 pt-4 sm:px-6">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <h1 className="font-display text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground">Atualize seus dados e preferências de notificação</p>
        </div>

        <section className="glass mt-5 rounded-3xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold">Informações Pessoais</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" required>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={150} />
            </Field>
            <Field label="E-mail" required>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field label="Telefone">
              <Input value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="(11) 99999-9999" />
            </Field>
          </div>
        </section>

        <section className="glass mt-5 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Notificações</h2>
              <p className="text-sm text-muted-foreground">Receba lembretes de agendamentos pelo canal de sua preferência</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="notif-toggle" className="text-sm">Receber notificações</Label>
              <Switch id="notif-toggle" checked={notifEnabled} onCheckedChange={setNotifEnabled} />
            </div>
          </div>

          {notifEnabled ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MethodCard
                  active={method === "EMAIL"}
                  onClick={() => setMethod("EMAIL")}
                  icon={<Mail className="h-6 w-6" />}
                  title="E-mail"
                  desc="Receba por e-mail"
                />
                <MethodCard
                  active={method === "WHATSAPP"}
                  onClick={() => setMethod("WHATSAPP")}
                  icon={<MessageCircle className="h-6 w-6" />}
                  title="WhatsApp"
                  desc="Receba no WhatsApp"
                />
              </div>
              {method === "EMAIL" ? (
                <Field label="E-mail para notificações" required className="mt-4">
                  <Input type="email" value={notifEmail} onChange={(event) => setNotifEmail(event.target.value)} placeholder="seu@email.com" />
                </Field>
              ) : method === "WHATSAPP" ? (
                <Field label="Número do WhatsApp" required className="mt-4">
                  <Input value={notifWhatsapp} onChange={(event) => setNotifWhatsapp(maskPhone(event.target.value))} placeholder="(11) 99999-9999" />
                </Field>
              ) : null}
            </>
          ) : null}
        </section>

        <div className="mt-5 flex justify-end">
          <Button onClick={() => void save({ initialConfigDone: true })} disabled={saving} className="bg-gradient-primary">
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Salvar alterações
          </Button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 inline-block text-sm font-medium">
        {label}{required ? <span className="text-rose-500"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function MethodCard({ active, onClick, icon, title, desc }: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-soft flex items-center gap-3 rounded-2xl p-4 text-left transition ${active ? "ring-2 ring-primary" : "hover:bg-primary/5"}`}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
        {icon}
      </span>
      <span>
        <span className="block font-display font-bold">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

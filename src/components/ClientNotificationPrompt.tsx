"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Lightbulb, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

function toPayload(client: ClientResponse, notificacaoConfig: NotificationConfig) {
  return {
    nomeCompleto: client.nomeCompleto,
    telefone: client.telefone,
    email: client.email,
    endereco: {
      cep: client.endereco.cep,
      endereco: client.endereco.endereco,
      idCidade: client.endereco.idCidade,
    },
    notificacaoConfig,
  };
}

export function ClientNotificationPrompt() {
  const router = useRouter();
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch("/api/cliente/me", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as ClientResponse | null;

      if (!active || !response.ok || !payload || !("id" in payload)) return;

      setClient(payload);
      setOpen(payload.notificacaoConfig?.configuracaoInicialConcluida !== true);
    }

    queueMicrotask(() => {
      void load();
    });

    return () => {
      active = false;
    };
  }, []);

  async function savePreference(config: NotificationConfig, successMessage: string) {
    if (!client) return;

    setSaving(true);
    const response = await fetch("/api/cliente/me", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(client, config)),
    });
    const payload = (await response.json().catch(() => null)) as ClientResponse | { message?: string } | null;
    setSaving(false);

    if (!response.ok || !payload || !("id" in payload)) {
      toast.error(getMessage(payload, "Não foi possível salvar sua preferência de notificação."));
      return;
    }

    setClient(payload);
    setOpen(false);
    toast.success(successMessage);
  }

  function pick(method: Method) {
    if (!client) return;

    if (method === "WHATSAPP" && onlyDigits(client.telefone).length < 10) {
      toast.error("Atualize seu telefone para ativar notificações por WhatsApp.");
      router.push("/cliente/configuracoes");
      return;
    }

    void savePreference(
      {
        receberNotificacoes: true,
        configuracaoInicialConcluida: true,
        metodoPreferencial: method,
        emailNotificacao: method === "EMAIL" ? client.email : null,
        whatsappNotificacao: method === "WHATSAPP" ? client.telefone : null,
      },
      "Preferência de notificação salva.",
    );
  }

  function dismiss() {
    if (!client) return;

    void savePreference(
      {
        receberNotificacoes: false,
        configuracaoInicialConcluida: true,
        metodoPreferencial: null,
        emailNotificacao: null,
        whatsappNotificacao: null,
      },
      "Tudo bem, você pode configurar notificações depois.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" /> Notificações de Agendamento
          </DialogTitle>
          <DialogDescription>Como você prefere receber notificações?</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <BigPickBtn disabled={saving} onClick={() => pick("EMAIL")} icon={<Mail className="h-7 w-7" />} title="E-mail" />
          <BigPickBtn disabled={saving} onClick={() => pick("WHATSAPP")} icon={<MessageCircle className="h-7 w-7" />} title="WhatsApp" />
        </div>
        <div className="glass-soft mt-2 flex items-start gap-3 rounded-2xl p-3 text-sm">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Dica:</span> Ativar lembretes reduz faltas e ajuda você a não esquecer seus compromissos.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={dismiss} disabled={saving}>
            Agora não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BigPickBtn({
  disabled,
  onClick,
  icon,
  title,
}: {
  disabled: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="glass-soft grid place-items-center gap-2 rounded-2xl p-5 transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">{icon}</span>
      <span className="font-display font-bold">{title}</span>
    </button>
  );
}

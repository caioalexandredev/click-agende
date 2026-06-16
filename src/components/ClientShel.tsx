"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, CalendarClock, LogOut, Menu, Settings, Store, X } from "lucide-react";
import { toast } from "sonner";

import { ClientNotificationPrompt } from "@/components/ClientNotificationPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

type ClientCtx = {
  id: string;
  full_name: string;
};

type ClientResponse = {
  id?: string;
  nomeCompleto?: string;
  nome?: string;
};

export function useClientGuard() {
  const router = useRouter();
  const [client, setClient] = useState<ClientCtx | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadClient() {
      try {
        const response = await fetch("/api/cliente/me", { cache: "no-store" });

        if (response.status === 401 || response.status === 403) {
          router.push("/cliente/login");
          return;
        }

        if (!response.ok) throw new Error("Não foi possível carregar o cliente.");

        const payload = (await response.json()) as ClientResponse;
        if (!active) return;

        setClient({
          id: payload.id ?? "",
          full_name: payload.nomeCompleto ?? payload.nome ?? "",
        });
      } catch {
        if (active) setClient(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadClient();

    return () => {
      active = false;
    };
  }, [router]);

  return { client, loading };
}

export function ClientHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/cliente", label: "Estabelecimentos", icon: Store },
    { href: "/cliente/agendamentos", label: "Meus Agendamentos", icon: CalendarClock },
    { href: "/cliente/configuracoes", label: "Configurações", icon: Settings },
  ];

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/cliente/login");
  }

  return (
    <>
      <header className="relative z-20">
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
            <Link href="/cliente" className="flex min-w-0 items-center gap-2">
              <div className="bg-gradient-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-lg">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="truncate font-display text-lg font-bold">ClickAgende</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Button variant="ghost" onClick={signOut} className="hidden gap-1.5 sm:inline-flex">
                <LogOut className="h-4 w-4" /> Sair
              </Button>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="glass-soft grid h-10 w-10 place-items-center rounded-full md:hidden"
                aria-label="Menu"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {open ? (
            <div className="glass mt-2 grid gap-1 rounded-2xl p-2 md:hidden">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      active ? "bg-primary/15 text-primary" : "hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <ClientNotificationPrompt />
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  LogOut,
  Building2,
  Users2,
  Scissors,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

type Company = {
  id: string;
  business_name: string;
};

const mockCompany: Company = {
  id: "mock-company-1",
  business_name: "ClickAgende Studio",
};

export function useCompanyGuard() {
  return { company: mockCompany, loading: false };
}

export function CompanyHeader({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/empresa", label: "Dashboard", icon: LayoutDashboard },
    { href: "/empresa/dados", label: "Empresa", icon: Building2 },
    { href: "/empresa/profissionais", label: "Profissionais", icon: Users2 },
    { href: "/empresa/servicos", label: "Serviços", icon: Scissors },
  ];

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/empresa/login");
  }

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
              className="glass-soft grid h-10 w-10 place-items-center rounded-full lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="glass mt-2 grid gap-1 rounded-2xl p-2 lg:hidden">
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
  );
}

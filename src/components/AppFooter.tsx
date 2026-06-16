import Link from "next/link";
import { CalendarCheck, Mail, ShieldCheck } from "lucide-react";

const footerLinks = [
  { href: "/cliente", label: "Encontrar empresas" },
  { href: "/empresa", label: "Painel da empresa" },
  { href: "/termos-de-uso", label: "Termos de uso" },
  { href: "/politica-de-privacidade", label: "Privacidade" },
];

export function AppFooter() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="bg-gradient-primary grid h-11 w-11 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-lg">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-bold">ClickAgende</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Agendamentos, serviços e comunicação em um fluxo simples para clientes e empresas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-primary">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              LGPD e segurança por padrão
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Notificações por email e WhatsApp
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} ClickAgende. Todos os direitos reservados.</span>
          <span>Feito para organizar atendimentos com clareza e confiança.</span>
        </div>
      </div>
    </footer>
  );
}

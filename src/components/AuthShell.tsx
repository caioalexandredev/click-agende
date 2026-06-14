import { ArrowLeft, CalendarCheck } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  badge: string;
  tone: "client" | "company";
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, badge, tone, children, footer }: Props) {
  const isCompany = tone === "company";
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-primary grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-lg">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">ClickAgende</span>
        </Link>
        <ThemeToggle />
      </header>

      <main
        className={`relative z-10 mx-auto px-5 pb-16 pt-4 ${isCompany ? "max-w-5xl" : "max-w-md"
          }`}
      >
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {badge}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-6">{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

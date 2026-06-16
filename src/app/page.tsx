import AreaCard from "@/components/card/AreaCard";
import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Store, Users } from "lucide-react";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight">ClickAgende</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-8 sm:pt-16">
        <section className="mx-auto max-w-3xl text-center">
          <span className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Agendamento simples, do clique à confirmação
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Conectando você aos melhores{" "}
            <span className="text-gradient">profissionais</span> da sua cidade
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Marque, gerencie e acompanhe atendimentos com profissionais autônomos e empresas, tudo
            em um só lugar.
          </p>
        </section>

        <section className="mx-auto mt-12 grid max-w-4xl gap-5 sm:mt-16 sm:grid-cols-2">
          <AreaCard
            to="/cliente/login"
            icon={<Users className="h-6 w-6" />}
            badge="Sou Cliente"
            title="Agende serviços"
            description="Encontre profissionais, escolha horário e acompanhe seus agendamentos."
            tone="primary"
          />
          <AreaCard
            to="/empresa/login"
            icon={<Store className="h-6 w-6" />}
            badge="Sou Empresa"
            title="Gerencie sua agenda"
            description="Painel completo para gerir serviços, profissionais e clientes."
            tone="accent"
          />
        </section>

        <section className="mx-auto mt-20 grid max-w-5xl gap-4 sm:grid-cols-3">
          {[
            { t: "Rápido", d: "Agendamentos em poucos cliques." },
            { t: "Organizado", d: "Sua agenda sempre sincronizada." },
            { t: "Confiável", d: "Profissionais verificados e avaliados." },
          ].map((f) => (
            <div key={f.t} className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

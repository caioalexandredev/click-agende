import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AreaCard({
  to,
  icon,
  badge,
  title,
  description,
  tone,
}: {
  to: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  tone: "primary" | "accent";
}) {
  return (
    <Link
      href={to}
      className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-2xl sm:p-8"
    >
      <div
        className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl transition group-hover:scale-110 ${tone === "primary" ? "bg-primary/40" : "bg-accent/40"
          }`}
      />
      <div className="relative">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-lg ${tone === "primary" ? "bg-gradient-primary" : "bg-gradient-hero"
            }`}
        >
          {icon}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {badge}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          Entrar
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
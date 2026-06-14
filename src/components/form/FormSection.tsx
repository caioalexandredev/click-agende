import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5", className)}>
      <h2 className="font-display text-sm font-bold uppercase text-muted-foreground">{title}</h2>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
  highlightedDays?: Set<string>;
}

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function MiniCalendar({ month, selected, onSelect, onMonthChange, highlightedDays }: Props) {
  const today = new Date();
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const isSame = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="glass-soft grid h-8 w-8 place-items-center rounded-lg transition hover:bg-primary/10"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="glass-soft grid h-8 w-8 place-items-center rounded-lg transition hover:bg-primary/10"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-muted-foreground">
        {WD.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const outside = d.getMonth() !== month.getMonth();
          const isToday = isSame(d, today);
          const isSelected = isSame(d, selected);
          const hasEvents = highlightedDays?.has(ymd(d));
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect(d)}
              className={[
                "relative grid h-9 place-items-center rounded-lg text-sm transition",
                outside ? "text-muted-foreground/40" : "text-foreground",
                isSelected
                  ? "bg-gradient-primary font-bold text-primary-foreground shadow-lg"
                  : isToday
                    ? "ring-1 ring-primary/60 font-semibold"
                    : "hover:bg-primary/10",
              ].join(" ")}
            >
              {d.getDate()}
              {hasEvents && !isSelected ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const dateToYMD = ymd;

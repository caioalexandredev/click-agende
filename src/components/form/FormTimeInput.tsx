"use client";

import { AlertCircle, Check, ChevronDown } from "lucide-react";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormTimeInputProps = {
  id: string;
  label: string;
  value?: string;
  name?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
  minuteStep?: number;
};

const HOURS = Array.from({ length: 24 }, (_, index) => index);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseTime(value?: string) {
  const match = value?.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export const FormTimeInput = forwardRef<HTMLButtonElement, FormTimeInputProps>(
  (
    {
      id,
      label,
      value,
      name,
      onChange,
      onBlur,
      error,
      hint,
      icon,
      placeholder = "Selecione um horário",
      required,
      disabled,
      wrapperClassName,
      minuteStep = 5,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const parsedValue = parseTime(value);
    const selectedHour = parsedValue?.hour ?? 8;
    const selectedMinute = parsedValue?.minute ?? 0;
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;

    const minutes = useMemo(() => {
      const baseMinutes = Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, index) => index * minuteStep,
      ).filter((minute) => minute < 60);

      if (parsedValue && !baseMinutes.includes(parsedValue.minute)) {
        return [...baseMinutes, parsedValue.minute].sort((a, b) => a - b);
      }

      return baseMinutes;
    }, [minuteStep, parsedValue]);

    useEffect(() => {
      if (!open) return;

      function handlePointerDown(event: PointerEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
          onBlur?.();
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          setOpen(false);
          onBlur?.();
        }
      }

      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [onBlur, open]);

    function updateTime(nextHour: number, nextMinute: number) {
      onChange(`${pad(nextHour)}:${pad(nextMinute)}`);
    }

    function handleMinuteSelect(minute: number) {
      updateTime(selectedHour, minute);
      setOpen(false);
      onBlur?.();
    }

    return (
      <div ref={containerRef} className={cn("relative space-y-1.5", wrapperClassName)}>
        <Label htmlFor={id}>
          {required ? <span className="text-destructive">*</span> : null}
          {required ? " " : null}
          {label}
        </Label>

        <input name={name} value={value ?? ""} readOnly hidden />

        <button
          ref={ref}
          id={id}
          type="button"
          aria-describedby={errorId ?? hintId}
          aria-expanded={open}
          data-invalid={Boolean(error)}
          disabled={disabled}
          onBlur={onBlur}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-left text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-9",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          {icon ? (
            <span className="absolute left-3 flex h-4 w-4 items-center justify-center text-muted-foreground">
              {icon}
            </span>
          ) : null}
          <span className={cn("min-w-0 flex-1 truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>

        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
            <div className="grid grid-cols-[1fr_0.55fr] gap-3">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Hora</p>
                <div className="grid max-h-52 grid-cols-4 gap-1 overflow-y-auto pr-1">
                  {HOURS.map((hour) => {
                    const selected = hour === selectedHour;

                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => updateTime(hour, selectedMinute)}
                        className={cn(
                          "grid h-9 place-items-center rounded-md text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        )}
                      >
                        {pad(hour)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Min</p>
                <div className="grid max-h-52 gap-1 overflow-y-auto pr-1">
                  {minutes.map((minute) => {
                    const selected = minute === selectedMinute;

                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleMinuteSelect(minute)}
                        className={cn(
                          "flex h-9 items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        )}
                      >
                        {pad(minute)}
                        {selected ? <Check className="h-3.5 w-3.5" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <p id={errorId} className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

FormTimeInput.displayName = "FormTimeInput";

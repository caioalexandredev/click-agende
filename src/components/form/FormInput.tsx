import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInputProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  icon?: ReactNode;
};

export function FormInput({ id, label, error, icon, className, ...props }: FormInputProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            "h-11",
            icon && "pl-9",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

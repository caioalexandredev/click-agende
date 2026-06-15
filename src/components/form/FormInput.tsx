import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInputProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
  wrapperClassName?: string;
};

export function FormInput({
  id,
  label,
  error,
  icon,
  hint,
  className,
  wrapperClassName,
  ...props
}: FormInputProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  const hintId = hint && id ? `${id}-hint` : undefined;
  const required = Boolean(props.required);

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <Label htmlFor={id}>
        {required ? <span className="text-destructive">*</span> : null}
        {required ? " " : null}
        {label}
      </Label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId ?? hintId}
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
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

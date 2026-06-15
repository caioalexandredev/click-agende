import { AlertCircle } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps = ComponentProps<typeof Textarea> & {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export function FormTextarea({
  id,
  label,
  error,
  hint,
  className,
  wrapperClassName,
  ...props
}: FormTextareaProps) {
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
      <Textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId ?? hintId}
        className={cn(
          "min-h-28 resize-y",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
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

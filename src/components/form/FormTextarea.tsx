import { AlertCircle } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps = ComponentProps<typeof Textarea> & {
  label: string;
  error?: string;
  wrapperClassName?: string;
};

export function FormTextarea({
  id,
  label,
  error,
  className,
  wrapperClassName,
  ...props
}: FormTextareaProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
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
      ) : null}
    </div>
  );
}

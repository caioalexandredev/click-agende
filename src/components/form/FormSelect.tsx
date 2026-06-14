"use client";

import { AlertCircle } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type FormSelectProps = Omit<ComponentProps<typeof Select>, "children"> & {
  id: string;
  label: string;
  options: FormSelectOption[];
  error?: string;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function FormSelect({
  id,
  label,
  options,
  error,
  placeholder,
  triggerClassName,
  contentClassName,
  ...props
}: FormSelectProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select {...props}>
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            "h-11 w-full",
            error && "border-destructive focus:ring-destructive",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

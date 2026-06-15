"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Clock, Loader2, Mail, Phone, UserRound } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { professionalSchema, type ProfessionalForm } from "../schema";
import type { Professional } from "../types";

type ProfessionalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
  onSubmit: (data: ProfessionalForm) => void;
};

const DEFAULT_VALUES: ProfessionalForm = {
  name: "",
  role: "",
  phone: "",
  email: "",
  workStart: "08:00",
  workEnd: "18:00",
  status: "active",
  bio: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function ProfessionalDialog({
  open,
  onOpenChange,
  professional,
  onSubmit,
}: ProfessionalDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalForm>({
    resolver: zodResolver(professionalSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;

    reset(
      professional
        ? {
            name: professional.name,
            role: professional.role,
            phone: professional.phone,
            email: professional.email,
            workStart: professional.workStart,
            workEnd: professional.workEnd,
            status: professional.status,
            bio: professional.bio ?? "",
          }
        : DEFAULT_VALUES,
    );
  }, [open, professional, reset]);

  function submit(data: ProfessionalForm) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{professional ? "Editar profissional" : "Novo profissional"}</DialogTitle>
          <DialogDescription>
            Mantenha os dados do profissional atualizados para organizar agenda e atendimento.
          </DialogDescription>
        </DialogHeader>

        <form id="professional-form" onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <FormInput
            id="name"
            label="Nome"
            placeholder="Nome completo"
            maxLength={120}
            icon={<UserRound className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />

          <FormInput
            id="role"
            label="Especialidade por escrito"
            placeholder="Ex: Cabeleireira, barbeiro, manicure..."
            maxLength={80}
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            error={errors.role?.message}
            {...register("role")}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormInput
                id="phone"
                label="Telefone"
                placeholder="(11) 99999-9999"
                inputMode="tel"
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatPhone(event.target.value))}
              />
            )}
          />

          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="profissional@email.com"
            autoComplete="email"
            maxLength={150}
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <FormInput
            id="workStart"
            label="Início da jornada"
            type="time"
            icon={<Clock className="h-4 w-4" />}
            error={errors.workStart?.message}
            {...register("workStart")}
          />

          <FormInput
            id="workEnd"
            label="Fim da jornada"
            type="time"
            icon={<Clock className="h-4 w-4" />}
            error={errors.workEnd?.message}
            {...register("workEnd")}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <FormSelect
                id="status"
                label="Status"
                placeholder="Selecione..."
                options={[
                  { value: "active", label: "Ativo" },
                  { value: "inactive", label: "Inativo" },
                ]}
                error={errors.status?.message}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />

          <FormTextarea
            id="bio"
            label="Observações"
            placeholder="Informações internas sobre agenda, preferências ou atuação..."
            maxLength={300}
            wrapperClassName="sm:col-span-2"
            className="min-h-28"
            error={errors.bio?.message}
            {...register("bio")}
          />
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="professional-form" disabled={isSubmitting} className="bg-gradient-primary">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {professional ? "Salvar alterações" : "Cadastrar profissional"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

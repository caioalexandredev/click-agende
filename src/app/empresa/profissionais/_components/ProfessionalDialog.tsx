"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  BriefcaseBusiness,
  Clock,
  ImageIcon,
  Loader2,
  Mail,
  Phone,
  Scissors,
  UserRound,
} from "lucide-react";
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
import type { Professional, ProfessionalServiceOption } from "../types";

type ProfessionalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
  serviceOptions: ProfessionalServiceOption[];
  onSubmit: (data: ProfessionalForm) => void;
};

const DEFAULT_VALUES: ProfessionalForm = {
  name: "",
  role: "",
  phone: "",
  email: "",
  profileImageUrl: "",
  workStart: "08:00",
  workEnd: "18:00",
  serviceIds: [],
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
  serviceOptions,
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
            profileImageUrl: professional.profileImageUrl ?? "",
            workStart: professional.workStart,
            workEnd: professional.workEnd,
            serviceIds: professional.serviceIds,
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
            id="profileImageUrl"
            label="URL da foto de perfil"
            placeholder="https://i.pravatar.cc/150?img=..."
            icon={<ImageIcon className="h-4 w-4" />}
            error={errors.profileImageUrl?.message}
            {...register("profileImageUrl")}
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

          <Controller
            control={control}
            name="serviceIds"
            render={({ field }) => (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Serviços que atende</p>
                </div>
                <div className="grid gap-2 rounded-xl border border-input bg-background/60 p-3 sm:grid-cols-2">
                  {serviceOptions.map((service) => {
                    const checked = field.value.includes(service.id);

                    return (
                      <label
                        key={service.id}
                        className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm transition hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                          checked={checked}
                          onChange={(event) => {
                            const nextValue = event.target.checked
                              ? [...field.value, service.id]
                              : field.value.filter((id) => id !== service.id);

                            field.onChange(nextValue);
                          }}
                        />
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground">{service.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {service.durationMin} minutos
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.serviceIds ? (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.serviceIds.message}
                  </p>
                ) : null}
              </div>
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

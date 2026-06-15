"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Scissors } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormInput } from "@/components/form/FormInput";
import { ImageUploadInput } from "@/components/form/ImageUploadInput";
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
import { serviceSchema, type ServiceForm } from "../schema";
import type { Service } from "../types";

type ServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSubmit: (data: ServiceForm) => Promise<boolean>;
};

const DEFAULT_VALUES: ServiceForm = {
  name: "",
  description: "",
  price: "",
  durationMin: "",
  status: "active",
  imageUrl: "",
};

function formatCurrencyInput(value: string) {
  const clean = value.replace(/[^\d,]/g, "");
  const parts = clean.split(",");
  const integer = parts[0]?.replace(/^0+(?=\d)/, "") ?? "";
  const cents = parts[1]?.slice(0, 2);

  return cents === undefined ? integer : `${integer},${cents}`;
}

function formatPriceForForm(value: number) {
  return value.toFixed(2).replace(".", ",");
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/empresa/upload-imagem", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.message ?? "Não foi possível enviar a imagem.");
  }

  return payload.url;
}

export function ServiceDialog({ open, onOpenChange, service, onSubmit }: ServiceDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;

    reset(
      service
        ? {
            name: service.name,
            description: service.description,
            price: formatPriceForForm(service.price),
            durationMin: String(service.durationMin),
            status: service.status,
            imageUrl: service.imageUrl,
          }
        : DEFAULT_VALUES,
    );
  }, [open, reset, service]);

  async function submit(data: ServiceForm) {
    const success = await onSubmit(data);
    if (success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          <DialogDescription>
            Configure preço, duração e informações exibidas para clientes durante o agendamento.
          </DialogDescription>
        </DialogHeader>

        <form id="service-form" onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <FormInput
            id="name"
            required
            label="Nome do serviço"
            placeholder="Ex: Corte de cabelo"
            maxLength={100}
            icon={<Scissors className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <FormInput
                id="price"
                required
                label="Preço (R$)"
                placeholder="0,00"
                inputMode="decimal"
                error={errors.price?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatCurrencyInput(event.target.value))}
              />
            )}
          />

          <Controller
            control={control}
            name="durationMin"
            render={({ field }) => (
              <FormInput
                id="durationMin"
                required
                label="Duração (min)"
                placeholder="30"
                inputMode="numeric"
                icon={<Clock className="h-4 w-4" />}
                error={errors.durationMin?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <FormSelect
                id="status"
                required
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
            name="imageUrl"
            render={({ field }) => (
              <ImageUploadInput
                id="imageUrl"
                label="Imagem do serviço"
                value={field.value ?? ""}
                error={errors.imageUrl?.message}
                hint="Arraste uma imagem ou cole uma URL pública."
                wrapperClassName="sm:col-span-2"
                onChange={field.onChange}
                onUpload={uploadImage}
              />
            )}
          />

          <FormTextarea
            id="description"
            required
            label="Descrição"
            placeholder="Descreva o que está incluído no serviço..."
            maxLength={300}
            wrapperClassName="sm:col-span-2"
            className="min-h-28"
            error={errors.description?.message}
            {...register("description")}
          />
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="service-form" disabled={isSubmitting} className="bg-gradient-primary">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {service ? "Salvar alterações" : "Adicionar serviço"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

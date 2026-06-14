"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Lock, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { Button } from "@/components/ui/button";
import { clientSignupSchema, type ClientSignupForm } from "./schema";

type CityOption = {
  value: string;
  label: string;
};

const UF_OPTIONS = [
  { value: "AC", label: "AC" },
  { value: "AL", label: "AL" },
  { value: "AP", label: "AP" },
  { value: "AM", label: "AM" },
  { value: "BA", label: "BA" },
  { value: "CE", label: "CE" },
  { value: "DF", label: "DF" },
  { value: "ES", label: "ES" },
  { value: "GO", label: "GO" },
  { value: "MA", label: "MA" },
  { value: "MT", label: "MT" },
  { value: "MS", label: "MS" },
  { value: "MG", label: "MG" },
  { value: "PA", label: "PA" },
  { value: "PB", label: "PB" },
  { value: "PR", label: "PR" },
  { value: "PE", label: "PE" },
  { value: "PI", label: "PI" },
  { value: "RJ", label: "RJ" },
  { value: "RN", label: "RN" },
  { value: "RS", label: "RS" },
  { value: "RO", label: "RO" },
  { value: "RR", label: "RR" },
  { value: "SC", label: "SC" },
  { value: "SP", label: "SP" },
  { value: "SE", label: "SE" },
  { value: "TO", label: "TO" },
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function formatCep(value: string) {
  return onlyDigits(value).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export default function ClientSignupPage() {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ClientSignupForm>({
    resolver: zodResolver(clientSignupSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      cpf: "",
      phone: "",
      cep: "",
      uf: "",
      city: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const selectedUf = useWatch({ control, name: "uf" });

  async function loadCitiesByUf(uf: string) {
    setIsLoadingCities(true);

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      );

      if (!response.ok) throw new Error("Falha ao carregar cidades.");

      const data = (await response.json()) as Array<{ nome: string }>;
      setCities(data.map((city) => ({ value: city.nome, label: city.nome })));
    } catch {
      setCities([]);
      toast.error("Não foi possível carregar as cidades desta UF.");
    } finally {
      setIsLoadingCities(false);
    }
  }

  const cityPlaceholder = useMemo(() => {
    if (!selectedUf) return "Selecione a UF primeiro";
    if (isLoadingCities) return "Carregando cidades...";
    return "Selecione a cidade";
  }, [isLoadingCities, selectedUf]);

  async function onSubmit(data: ClientSignupForm) {
    toast.success("Cadastro realizado!", {
      description: `Conta criada para ${data.full_name}.`,
    });
  }

  return (
    <AuthShell
      tone="client"
      badge="Área do Cliente"
      title="Cadastro de Cliente"
      subtitle="Crie sua conta no ClickAgende"
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/cliente/login" className="font-semibold text-primary hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            id="full_name"
            label="Nome completo"
            maxLength={150}
            autoComplete="name"
            icon={<UserRound className="h-4 w-4" />}
            error={errors.full_name?.message}
            {...register("full_name")}
          />

          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormInput
                id="cpf"
                label="CPF"
                placeholder="000.000.000-00"
                inputMode="numeric"
                icon={<FileText className="h-4 w-4" />}
                error={errors.cpf?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatCpf(event.target.value))}
              />
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <FormInput
                id="cep"
                label="CEP"
                placeholder="00000-000"
                inputMode="numeric"
                icon={<MapPin className="h-4 w-4" />}
                error={errors.cep?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatCep(event.target.value))}
              />
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="uf"
            render={({ field }) => (
              <FormSelect
                id="uf"
                label="UF"
                placeholder="Selecione..."
                options={UF_OPTIONS}
                error={errors.uf?.message}
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  resetField("city");
                  setCities([]);
                  void loadCitiesByUf(value);
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <FormSelect
                id="city"
                label="Cidade"
                placeholder={cityPlaceholder}
                options={cities}
                disabled={!selectedUf || isLoadingCities}
                error={errors.city?.message}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="exemplo@exemplo.com"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            id="password"
            label="Senha"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <FormInput
            id="confirm"
            label="Confirmar senha"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary h-11 w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
        </Button>
      </form>
    </AuthShell>
  );
}

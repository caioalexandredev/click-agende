"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPinned,
  Phone,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { companySignupSchema, type CompanySignupForm } from "./schema";

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

function formatCnpj(value: string) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
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

export default function CompanySignup() {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CompanySignupForm>({
    resolver: zodResolver(companySignupSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      business_name: "",
      cnpj: "",
      phone: "",
      email: "",
      description: "",
      cep: "",
      address: "",
      uf: "",
      city: "",
      password: "",
      confirm: "",
      terms: false,
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

  async function onSubmit(data: CompanySignupForm) {
    toast.success("Conta criada com sucesso! Faça login para continuar.", {
      description: `Cadastro criado para ${data.business_name}.`,
    });
  }

  return (
    <AuthShell
      tone="company"
      badge="Painel da Empresa"
      title="Cadastro de Empresa"
      subtitle="Registre seu estabelecimento no Agendamento"
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/empresa/login" className="font-semibold text-primary hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2" noValidate>
        <Section title="Dados da empresa">
          <FormInput
            id="business_name"
            label="Nome da Empresa"
            placeholder="Nome do estabelecimento"
            maxLength={150}
            icon={<Building2 className="h-4 w-4" />}
            error={errors.business_name?.message}
            {...register("business_name")}
          />

          <Controller
            control={control}
            name="cnpj"
            render={({ field }) => (
              <FormInput
                id="cnpj"
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                icon={<FileText className="h-4 w-4" />}
                error={errors.cnpj?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatCnpj(event.target.value))}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormInput
                id="phone"
                label="Telefone"
                placeholder="(11) 3456-7890"
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
            placeholder="contato@empresa.com"
            autoComplete="email"
            maxLength={150}
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
        </Section>

        <Section title="Endereço">
          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <FormInput
                id="cep"
                label="CEP"
                placeholder="00000-000"
                inputMode="numeric"
                error={errors.cep?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatCep(event.target.value))}
              />
            )}
          />

          <FormInput
            id="address"
            label="Endereço Completo"
            placeholder="Rua, Bairro"
            maxLength={150}
            icon={<MapPinned className="h-4 w-4" />}
            error={errors.address?.message}
            {...register("address")}
          />

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
        </Section>

        <Section title="Descrição da empresa">
          <FormTextarea
            id="description"
            label="Descrição"
            placeholder="Descreva seu estabelecimento..."
            maxLength={500}
            error={errors.description?.message}
            wrapperClassName="lg:col-span-2"
            className="min-h-32"
            {...register("description")}
          />
        </Section>

        <Section title="Dados de acesso">
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
            label="Confirmar Senha"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </Section>

        <Section title="Termos e políticas" className="lg:col-span-2">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="flex items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? "terms-error" : undefined}
                {...register("terms")}
              />
              <span>
                Eu li e aceito os{" "}
                <Link href="/termos-de-uso" target="_blank" className="font-semibold text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/politica-de-privacidade"
                  target="_blank"
                  className="font-semibold text-primary hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>
            {errors.terms ? (
              <p id="terms-error" className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.terms.message}
              </p>
            ) : null}
          </div>
        </Section>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary h-11 w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar Empresa"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5", className)}>
      <h2 className="font-display text-sm font-bold uppercase text-muted-foreground">{title}</h2>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

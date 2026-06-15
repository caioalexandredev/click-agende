"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { FormInput } from "@/components/form/FormInput";
import FormSection from "@/components/form/FormSection";
import { FormSelect } from "@/components/form/FormSelect";
import { Button } from "@/components/ui/button";
import { clientSignupSchema, type ClientSignupForm } from "./schema";

type CityOption = {
  value: string;
  label: string;
};

type CityResponse = {
  id: number;
  nome: string;
  uf: string;
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
  const router = useRouter();
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
      email: "",
      phone: "",
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
      const response = await fetch(`/api/cidades/${uf}`);

      if (!response.ok) throw new Error("Falha ao carregar cidades.");

      const data = (await response.json()) as CityResponse[];
      setCities(data.map((city) => ({ value: String(city.id), label: city.nome })));
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
    const response = await fetch("/api/auth/register/cliente", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nomeCompleto: data.full_name,
        cpf: data.cpf,
        telefone: data.phone,
        endereco: {
          cep: data.cep,
          endereco: data.address,
          idCidade: Number(data.city),
        },
        usuario: {
          email: data.email,
          senha: data.password,
          confirmarSenha: data.confirm,
        },
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(payload?.message ?? "Não foi possível cadastrar o cliente.");
      return;
    }

    toast.success("Conta criada com sucesso! Faça login para continuar.", {
      description: `Cadastro criado para ${data.full_name}.`,
    });
    router.push("/cliente/login");
  }

  return (
    <AuthShell
      tone="client"
      size="wide"
      badge="Área do Cliente"
      title="Cadastro de Cliente"
      subtitle="Crie sua conta no Agendamento"
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/cliente/login" className="font-semibold text-primary hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2" noValidate>
        <FormSection title="Dados pessoais">
          <FormInput
            id="full_name"
            required
            label="Nome Completo"
            placeholder="Seu nome"
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
                required
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

          <FormInput
            id="email"
            required
            label="Email"
            type="email"
            placeholder="cliente@exemplo.com"
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormInput
                id="phone"
                required
                label="Telefone"
                placeholder="(11) 98765-4321"
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
        </FormSection>

        <FormSection title="Endereço">
          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <FormInput
                id="cep"
                required
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

          <FormInput
            id="address"
            required
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
                required
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
                required
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
        </FormSection>

        <FormSection title="Dados de acesso">
          <FormInput
            id="password"
            required
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
            required
            label="Confirmar Senha"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </FormSection>

        <FormSection title="Termos e políticas">
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
        </FormSection>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary h-11 w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

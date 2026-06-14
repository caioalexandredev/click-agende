"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { FormInput } from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { companySignupSchema, type CompanySignupForm } from "./schema";

export default function CompanySignup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanySignupForm>({
    resolver: zodResolver(companySignupSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      business_name: "",
      full_name: "",
      phone: "",
      email: "",
      address: "",
      cep: "",
      uf: "",
      city: "",
      password: "",
      confirm: "",
    },
  });

  async function onSubmit(data: CompanySignupForm) {
    toast.success("Empresa cadastrada com sucesso!", {
      description: `Cadastro criado para ${data.business_name}.`,
    });
  }

  return (
    <AuthShell
      tone="company"
      badge="Painel da Empresa"
      title="Cadastro de Empresa"
      subtitle="Registre seu estabelecimento no ClickAgende"
      footer={
        <>
          Já cadastrou?{" "}
          <Link href="/empresa/login" className="font-semibold text-primary hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2" noValidate>
        <Section title="Dados do estabelecimento">
          <FormInput
            id="business_name"
            label="Nome do estabelecimento"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.business_name?.message}
            {...register("business_name")}
          />

          <FormInput
            id="phone"
            label="Telefone"
            placeholder="(11) 3456-7890"
            inputMode="tel"
            icon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <FormInput
            id="address"
            label="Endereço completo"
            placeholder="Rua, número, bairro"
            icon={<MapPinned className="h-4 w-4" />}
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              id="cep"
              label="CEP"
              placeholder="00000-000"
              inputMode="numeric"
              error={errors.cep?.message}
              {...register("cep")}
            />
            <FormInput
              id="uf"
              label="UF"
              placeholder="SP"
              maxLength={2}
              className="uppercase"
              error={errors.uf?.message}
              {...register("uf")}
            />
            <FormInput
              id="city"
              label="Cidade"
              icon={<MapPin className="h-4 w-4" />}
              error={errors.city?.message}
              {...register("city")}
            />
          </div>
        </Section>

        <Section title="Dados de acesso">
          <FormInput
            id="full_name"
            label="Nome do responsável"
            autoComplete="name"
            icon={<UserRound className="h-4 w-4" />}
            error={errors.full_name?.message}
            {...register("full_name")}
          />

          <FormInput
            id="email"
            label="E-mail"
            type="email"
            placeholder="empresa@exemplo.com"
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <FormInput
            id="password"
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <FormInput
            id="confirm"
            label="Confirmar senha"
            type="password"
            placeholder="Repita sua senha"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </Section>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary h-11 w-full">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Cadastrar estabelecimento"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5">
      <h2 className="font-display text-sm font-bold uppercase text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

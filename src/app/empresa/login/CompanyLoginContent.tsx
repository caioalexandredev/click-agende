"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { FormInput } from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { companyLoginSchema, type CompanyLoginForm } from "./schema";
import { AUTH_ROLES } from "@/lib/auth/routes";

export default function CompanyLoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyLoginForm>({
    resolver: zodResolver(companyLoginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: CompanyLoginForm) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        expectedRole: AUTH_ROLES.ADMIN,
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(payload?.message ?? "Não foi possível entrar.");
      return;
    }

    toast.success("Bem-vindo!", {
      description: `Acessando o painel de ${data.email}.`,
    });
    router.push(payload?.redirectTo ?? "/empresa");
  }

  return (
    <AuthShell
      tone="company"
      badge="Painel da Empresa"
      title="Login Empresa"
      subtitle="Acesse o painel de gestão do seu estabelecimento"
      footer={
        <>
          Ainda não cadastrou sua empresa?{" "}
          <Link href="/empresa/cadastro" className="font-semibold text-primary hover:underline">
            Criar cadastro
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            autoComplete="current-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary h-11 w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar no painel"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}

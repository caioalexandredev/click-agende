"use client";

import Link from "next/link";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CompanyLoginForm = {
  email: string;
  password: string;
};

export default function CompanyLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyLoginForm>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: CompanyLoginForm) {
    toast.success("Bem-vindo!", {
      description: `Acessando o painel de ${data.email}.`,
    });
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
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="empresa@exemplo.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "h-11 pl-9",
                  errors.email && "border-destructive focus-visible:ring-destructive",
                )}
                {...register("email", {
                  required: "Informe o e-mail da empresa.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Digite um e-mail válido.",
                  },
                })}
              />
            </div>
            {errors.email ? (
              <p id="email-error" className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(
                  "h-11 pl-9",
                  errors.password && "border-destructive focus-visible:ring-destructive",
                )}
                {...register("password", {
                  required: "Informe sua senha.",
                  minLength: {
                    value: 8,
                    message: "A senha precisa ter pelo menos 8 caracteres.",
                  },
                  validate: (value) =>
                    value.trim().length > 0 || "A senha não pode conter apenas espaços.",
                })}
              />
            </div>
            {errors.password ? (
              <p id="password-error" className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary h-11 w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar no painel"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}

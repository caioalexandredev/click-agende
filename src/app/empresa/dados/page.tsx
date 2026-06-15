"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  Mail,
  MapPinned,
  Phone,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { CompanyHeader, useCompanyGuard } from "@/components/CompanyShell";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { Button } from "@/components/ui/button";
import FullLoading from "@/components/loading/FullLoading";

type Form = {
  business_name: string;
  cnpj: string;
  phone: string;
  email: string;
  cep: string;
  address: string;
  uf: string;
  city: string;
  description: string;
};

const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const CITIES_BY_UF: Record<string, string[]> = {
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"],
  SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"],
  RJ: ["Rio de Janeiro", "Niterói", "Petrópolis", "Cabo Frio"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde"],
};

const INITIAL_FORM: Form = {
  business_name: "ClickAgende Studio",
  cnpj: "11.444.777/0001-61",
  phone: "(63) 3456-7890",
  email: "contato@clickagende.com",
  cep: "77000-000",
  address: "Rua das Flores",
  uf: "TO",
  city: "Palmas",
  description: "Estúdio especializado em beleza, bem-estar e atendimento com hora marcada.",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCNPJ(value: string) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function maskCEP(value: string) {
  return onlyDigits(value).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

function validateCNPJ(value: string) {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const total = weights.reduce((sum, weight, index) => sum + Number(base[index]) * weight, 0);
    const remainder = total % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

export default function DadosEmpresa() {
  const { company, loading } = useCompanyGuard();
  const [form, setForm] = useState<Form>(INITIAL_FORM);
  const [original, setOriginal] = useState<Form>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = useState(false);

  const cidades = form.uf ? (CITIES_BY_UF[form.uf] ?? [`Cidade mockada - ${form.uf}`]) : [];

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof Form, string>> = {};

    if (!form.business_name.trim()) nextErrors.business_name = "Nome é obrigatório.";
    else if (form.business_name.length > 150) nextErrors.business_name = "Máximo de 150 caracteres.";

    if (!form.cnpj.trim()) nextErrors.cnpj = "CNPJ é obrigatório.";
    else if (!validateCNPJ(form.cnpj)) nextErrors.cnpj = "Insira um CNPJ válido.";

    if (!form.phone.trim()) nextErrors.phone = "Telefone é obrigatório.";
    else if (![10, 11].includes(onlyDigits(form.phone).length)) {
      nextErrors.phone = "Digite um telefone válido.";
    }

    if (!form.email.trim()) nextErrors.email = "Email é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Email inválido.";

    if (!form.cep.trim()) nextErrors.cep = "CEP é obrigatório.";
    else if (!/^\d{5}-?\d{3}$/.test(form.cep)) nextErrors.cep = "Digite um CEP válido.";

    if (!form.address.trim()) nextErrors.address = "O endereço é obrigatório.";
    else if (form.address.length > 200) nextErrors.address = "Máximo de 200 caracteres.";

    if (!form.uf) nextErrors.uf = "UF é obrigatória.";
    if (!form.city.trim()) nextErrors.city = "Cidade é obrigatória.";
    if (form.description.length > 500) nextErrors.description = "Máximo de 500 caracteres.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function save() {
    if (!validate()) {
      toast.error("Corrija os campos destacados.");
      return;
    }

    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);
      setOriginal(form);
      toast.success("Empresa atualizada com sucesso!");
    }, 500);
  }

  function cancel() {
    setForm(original);
    setErrors({});
    toast.info("Alterações descartadas.");
  }

  if (loading) return <FullLoading />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <CompanyHeader businessName={company?.business_name ?? ""} />
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-4 sm:px-6">
        <Link
          href="/empresa"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
        <div className="glass mt-4 rounded-3xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Dados da Empresa</h1>
          <p className="mt-1 text-muted-foreground">Gerencie as informações do seu estabelecimento</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <FormInput
              id="business_name"
              label="Nome da Empresa"
              error={errors.business_name}
              wrapperClassName="md:col-span-2"
              value={form.business_name}
              maxLength={150}
              icon={<Building2 className="h-4 w-4" />}
              onChange={(event) => set("business_name", event.target.value)}
              placeholder="Ex: Studio Beleza & Estilo"
            />

            <FormInput
              id="cnpj"
              label="CNPJ"
              error={errors.cnpj}
              value={form.cnpj}
              icon={<FileText className="h-4 w-4" />}
              onChange={(event) => set("cnpj", maskCNPJ(event.target.value))}
              placeholder="00.000.000/0000-00"
            />

            <FormInput
              id="phone"
              label="Telefone"
              error={errors.phone}
              value={form.phone}
              icon={<Phone className="h-4 w-4" />}
              onChange={(event) => set("phone", maskPhone(event.target.value))}
              placeholder="(11) 3456-7890"
            />

            <FormInput
              id="email"
              label="Email"
              error={errors.email}
              wrapperClassName="md:col-span-2"
              hint="Alterar este email pode mudar o acesso de login."
              type="email"
              value={form.email}
              icon={<Mail className="h-4 w-4" />}
              onChange={(event) => set("email", event.target.value)}
              placeholder="contato@empresa.com"
            />

            <FormInput
              id="cep"
              label="CEP"
              error={errors.cep}
              value={form.cep}
              onChange={(event) => set("cep", maskCEP(event.target.value))}
              placeholder="00000-000"
            />

            <FormInput
              id="address"
              label="Endereço Completo"
              error={errors.address}
              value={form.address}
              maxLength={200}
              icon={<MapPinned className="h-4 w-4" />}
              onChange={(event) => set("address", event.target.value)}
              placeholder="Rua das Flores"
            />

            <FormSelect
              id="uf"
              label="UF"
              placeholder="Selecione..."
              options={UFS.map((uf) => ({ value: uf, label: uf }))}
              error={errors.uf}
              value={form.uf}
              onValueChange={(value) => {
                set("uf", value);
                set("city", "");
              }}
            />

            <FormSelect
              id="city"
              label="Cidade"
              placeholder={!form.uf ? "Selecione a UF primeiro" : "Selecione a cidade"}
              options={cidades.map((cidade) => ({ value: cidade, label: cidade }))}
              disabled={!form.uf}
              error={errors.city}
              value={form.city}
              onValueChange={(value) => set("city", value)}
            />

            <FormTextarea
              id="description"
              label="Descrição"
              error={errors.description}
              hint={`${form.description.length}/500`}
              wrapperClassName="md:col-span-2"
              value={form.description}
              maxLength={500}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Conte um pouco sobre o seu estabelecimento..."
              rows={4}
            />
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={cancel}>
              <X className="mr-1.5 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-primary">
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
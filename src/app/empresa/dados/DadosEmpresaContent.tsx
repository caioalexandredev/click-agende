"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type CityResponse = {
  id: number;
  nome: string;
  uf: string;
};

type CompanyResponse = {
  id: string;
  nome: string;
  cnpj: string;
  descricao: string;
  email: string;
  telefone: string;
  endereco?: {
    cep?: string;
    endereco?: string;
    idCidade?: number;
    uf?: string;
  };
};

const INITIAL_FORM: Form = {
  business_name: "",
  cnpj: "",
  phone: "",
  email: "",
  cep: "",
  address: "",
  uf: "",
  city: "",
  description: "",
};

const UF_OPTIONS = [
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
].map((uf) => ({ value: uf, label: uf }));

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

function companyToForm(data: CompanyResponse): Form {
  return {
    business_name: data.nome ?? "",
    cnpj: maskCNPJ(data.cnpj ?? ""),
    phone: maskPhone(data.telefone ?? ""),
    email: data.email ?? "",
    cep: maskCEP(data.endereco?.cep ?? ""),
    address: data.endereco?.endereco ?? "",
    uf: data.endereco?.uf ?? "",
    city: data.endereco?.idCidade ? String(data.endereco.idCidade) : "",
    description: data.descricao ?? "",
  };
}

export default function DadosEmpresaContent() {
  const { company, loading } = useCompanyGuard();
  const [form, setForm] = useState<Form>(INITIAL_FORM);
  const [original, setOriginal] = useState<Form>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [saving, setSaving] = useState(false);

  const cityOptions = useMemo(
    () => cities.map((city) => ({ value: String(city.id), label: city.nome })),
    [cities],
  );

  const cityPlaceholder = useMemo(() => {
    if (!form.uf) return "Selecione a UF primeiro";
    if (isLoadingCities) return "Carregando cidades...";
    return "Selecione a cidade";
  }, [form.uf, isLoadingCities]);

  async function loadCitiesByUf(uf: string) {
    if (!uf) {
      setCities([]);
      return;
    }

    setIsLoadingCities(true);

    try {
      const response = await fetch(`/api/cidades/${uf}`);
      if (!response.ok) throw new Error("Falha ao carregar cidades.");

      setCities((await response.json()) as CityResponse[]);
    } catch {
      setCities([]);
      toast.error("Nao foi possivel carregar as cidades desta UF.");
    } finally {
      setIsLoadingCities(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadCompany() {
      setIsLoadingCompany(true);

      try {
        const response = await fetch("/api/empresa/me");
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message ?? "Nao foi possivel carregar os dados da empresa.");
        }

        const nextForm = companyToForm(payload as CompanyResponse);
        if (!active) return;

        setForm(nextForm);
        setOriginal(nextForm);
        if (nextForm.uf) await loadCitiesByUf(nextForm.uf);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar os dados da empresa.");
      } finally {
        if (active) setIsLoadingCompany(false);
      }
    }

    void loadCompany();

    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof Form, string>> = {};

    if (!form.business_name.trim()) nextErrors.business_name = "Nome e obrigatorio.";
    else if (form.business_name.length > 150) nextErrors.business_name = "Maximo de 150 caracteres.";

    if (!form.cnpj.trim()) nextErrors.cnpj = "CNPJ e obrigatorio.";
    else if (!validateCNPJ(form.cnpj)) nextErrors.cnpj = "Insira um CNPJ valido.";

    if (!form.phone.trim()) nextErrors.phone = "Telefone e obrigatorio.";
    else if (![10, 11].includes(onlyDigits(form.phone).length)) {
      nextErrors.phone = "Digite um telefone valido.";
    }

    if (!form.email.trim()) nextErrors.email = "Email e obrigatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Email invalido.";

    if (!form.cep.trim()) nextErrors.cep = "CEP e obrigatorio.";
    else if (!/^\d{5}-?\d{3}$/.test(form.cep)) nextErrors.cep = "Digite um CEP valido.";

    if (!form.address.trim()) nextErrors.address = "O endereco e obrigatorio.";
    else if (form.address.length > 200) nextErrors.address = "Maximo de 200 caracteres.";

    if (!form.uf) nextErrors.uf = "UF e obrigatoria.";
    if (!form.city.trim()) nextErrors.city = "Cidade e obrigatoria.";
    if (!form.description.trim()) nextErrors.description = "Descricao e obrigatoria.";
    else if (form.description.length > 500) nextErrors.description = "Maximo de 500 caracteres.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function save() {
    if (!validate()) {
      toast.error("Corrija os campos destacados.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/empresa/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nome: form.business_name,
          cnpj: form.cnpj,
          telefone: form.phone,
          descricao: form.description,
          email: form.email,
          endereco: {
            cep: form.cep,
            endereco: form.address,
            idCidade: Number(form.city),
          },
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Nao foi possivel atualizar os dados da empresa.");
      }

      const nextForm = companyToForm(payload as CompanyResponse);
      setForm(nextForm);
      setOriginal(nextForm);
      if (nextForm.uf) await loadCitiesByUf(nextForm.uf);
      toast.success("Empresa atualizada com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel atualizar os dados da empresa.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setForm(original);
    setErrors({});
    toast.info("Alteracoes descartadas.");
  }

  if (loading || isLoadingCompany) return <FullLoading />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <CompanyHeader businessName={form.business_name || company?.business_name || ""} />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
        <div className="glass mt-4 rounded-3xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Dados da Empresa</h1>
          <p className="mt-1 text-muted-foreground">Gerencie as informações do seu estabelecimento</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <FormInput
              id="business_name"
              required
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
              required
              label="CNPJ"
              error={errors.cnpj}
              value={form.cnpj}
              icon={<FileText className="h-4 w-4" />}
              onChange={(event) => set("cnpj", maskCNPJ(event.target.value))}
              placeholder="00.000.000/0000-00"
            />

            <FormInput
              id="phone"
              required
              label="Telefone"
              error={errors.phone}
              value={form.phone}
              icon={<Phone className="h-4 w-4" />}
              onChange={(event) => set("phone", maskPhone(event.target.value))}
              placeholder="(11) 3456-7890"
            />

            <FormInput
              id="email"
              required
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
              required
              label="CEP"
              error={errors.cep}
              value={form.cep}
              onChange={(event) => set("cep", maskCEP(event.target.value))}
              placeholder="00000-000"
            />

            <FormInput
              id="address"
              required
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
              required
              label="UF"
              placeholder="Selecione..."
              options={UF_OPTIONS}
              error={errors.uf}
              value={form.uf}
              onValueChange={(value) => {
                set("uf", value);
                set("city", "");
                void loadCitiesByUf(value);
              }}
            />

            <FormSelect
              id="city"
              required
              label="Cidade"
              placeholder={cityPlaceholder}
              options={cityOptions}
              disabled={!form.uf || isLoadingCities}
              error={errors.city}
              value={form.city}
              onValueChange={(value) => set("city", value)}
            />

            <FormTextarea
              id="description"
              required
              label="Descricao"
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
              Salvar Alteracoes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

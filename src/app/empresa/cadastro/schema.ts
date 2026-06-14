import { z } from "zod";

const requiredText = (field: string) => `${field} é obrigatório.`;

export const companySignupSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(2, "Informe o nome do estabelecimento."),
    phone: z
      .string()
      .trim()
      .min(1, requiredText("Telefone"))
      .refine((value) => value.replace(/\D/g, "").length >= 10, "Digite um telefone válido."),
    address: z
      .string()
      .trim()
      .min(5, "Informe um endereço completo."),
    cep: z
      .string()
      .trim()
      .min(1, requiredText("CEP"))
      .regex(/^\d{5}-?\d{3}$/, "Digite um CEP válido."),
    uf: z
      .string()
      .trim()
      .length(2, "Digite a UF com 2 letras.")
      .regex(/^[A-Za-z]{2}$/, "Digite uma UF válida."),
    city: z
      .string()
      .trim()
      .min(2, "Informe a cidade."),
    full_name: z
      .string()
      .trim()
      .min(3, "Informe o nome do responsável."),
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail da empresa.")
      .email("Digite um e-mail válido."),
    password: z
      .string()
      .min(1, "Informe sua senha.")
      .min(8, "A senha precisa ter pelo menos 8 caracteres.")
      .refine((value) => value.trim().length > 0, "A senha não pode conter apenas espaços."),
    confirm: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem.",
    path: ["confirm"],
  });

export type CompanySignupForm = z.infer<typeof companySignupSchema>;

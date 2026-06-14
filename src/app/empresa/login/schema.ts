import { z } from "zod";

export const companyLoginSchema = z.object({
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
});

export type CompanyLoginForm = z.infer<typeof companyLoginSchema>;

import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const professionalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(120, "Máximo de 120 caracteres."),
  role: z
    .string()
    .trim()
    .min(1, "Especialidade é obrigatória.")
    .max(80, "Máximo de 80 caracteres."),
  phone: z
    .string()
    .trim()
    .min(1, "Telefone é obrigatório.")
    .refine((value) => [10, 11].includes(onlyDigits(value).length), {
      message: "Digite um telefone válido.",
    }),
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório.")
    .email("Email inválido.")
    .max(150, "Máximo de 150 caracteres."),
  status: z.enum(["active", "inactive"], {
    message: "Status é obrigatório.",
  }),
  bio: z.string().trim().max(300, "Máximo de 300 caracteres.").optional(),
});

export type ProfessionalForm = z.infer<typeof professionalSchema>;


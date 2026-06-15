import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const professionalSchema = z
  .object({
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
    profileImageUrl: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^https?:\/\/.+/.test(value), {
        message: "URL inválida.",
      }),
    workStart: z
      .string()
      .trim()
      .min(1, "Horário de início é obrigatório.")
      .regex(timeRegex, "Digite um horário válido."),
    workEnd: z
      .string()
      .trim()
      .min(1, "Horário de fim é obrigatório.")
      .regex(timeRegex, "Digite um horário válido."),
    serviceIds: z.array(z.string()).min(1, "Selecione ao menos um serviço."),
    status: z.enum(["active", "inactive"], {
      message: "Status é obrigatório.",
    }),
    bio: z.string().trim().max(300, "Máximo de 300 caracteres.").optional(),
  })
  .superRefine((data, ctx) => {
    if (!timeRegex.test(data.workStart) || !timeRegex.test(data.workEnd)) return;

    if (data.workStart >= data.workEnd) {
      ctx.addIssue({
        code: "custom",
        path: ["workEnd"],
        message: "O fim da jornada deve ser depois do início.",
      });
    }
  });

export type ProfessionalForm = z.infer<typeof professionalSchema>;

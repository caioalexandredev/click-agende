import { z } from "zod";

function parseCurrency(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  return Number(normalized);
}

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome do serviço é obrigatório.")
    .max(100, "Máximo de 100 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(300, "Máximo de 300 caracteres."),
  price: z
    .string()
    .trim()
    .min(1, "Preço é obrigatório.")
    .refine((value) => Number.isFinite(parseCurrency(value)) && parseCurrency(value) > 0, {
      message: "Digite um preço válido.",
    }),
  durationMin: z
    .string()
    .trim()
    .min(1, "Duração é obrigatória.")
    .regex(/^\d+$/, "Apenas números inteiros.")
    .refine((value) => Number(value) >= 5, "Duração mínima de 5 minutos.")
    .refine((value) => Number(value) <= 480, "Duração máxima de 480 minutos."),
  status: z.enum(["active", "inactive"], {
    message: "Status é obrigatório.",
  }),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/.test(value), {
      message: "URL inválida.",
    }),
});

export type ServiceForm = z.infer<typeof serviceSchema>;

export function serviceFormToPayload(data: ServiceForm) {
  return {
    ...data,
    price: parseCurrency(data.price),
    durationMin: Number(data.durationMin),
    description: data.description?.trim() || "",
    imageUrl: data.imageUrl?.trim() || "",
  };
}

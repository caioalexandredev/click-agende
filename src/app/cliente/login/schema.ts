import { z } from "zod";

export const clientLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório.")
    .email("Email inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

export type ClientLoginForm = z.infer<typeof clientLoginSchema>;

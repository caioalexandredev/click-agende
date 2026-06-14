import { z } from "zod";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calculateDigit = (base: string, factor: number) => {
    const total = base.split("").reduce((sum, digit) => {
      const result = sum + Number(digit) * factor;
      factor -= 1;
      return result;
    }, 0);
    const remainder = (total * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

export const clientSignupSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório.")
      .max(150, "Nome deve ter no máximo 150 caracteres.")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços."),
    cpf: z
      .string()
      .trim()
      .min(1, "CPF é obrigatório.")
      .refine(isValidCpf, "CPF inválido."),
    email: z
      .string()
      .trim()
      .min(1, "Email é obrigatório.")
      .email("Email inválido."),
    phone: z
      .string()
      .trim()
      .min(1, "Telefone é obrigatório.")
      .refine((value) => {
        const digits = onlyDigits(value);
        return digits.length === 10 || digits.length === 11;
      }, "Digite um telefone válido."),
    cep: z
      .string()
      .trim()
      .min(1, "CEP é obrigatório.")
      .regex(/^\d{5}-?\d{3}$/, "Digite um CEP válido."),
    address: z
      .string()
      .trim()
      .min(1, "Endereço é obrigatório.")
      .max(150, "Endereço deve ter no máximo 150 caracteres.")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Endereço deve conter apenas letras e espaços."),
    uf: z.string().min(1, "UF é obrigatória."),
    city: z.string().min(1, "Cidade é obrigatória."),
    password: z
      .string()
      .min(1, "Senha é obrigatória.")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial.",
      ),
    confirm: z.string().min(1, "Confirmação de senha é obrigatória."),
    terms: z
      .boolean()
      .refine(
        (value) => value,
        "Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.",
      ),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem.",
    path: ["confirm"],
  });

export type ClientSignupForm = z.infer<typeof clientSignupSchema>;

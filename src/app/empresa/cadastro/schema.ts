import { z } from "zod";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const total = weights.reduce((sum, weight, index) => {
      return sum + Number(base[index]) * weight;
    }, 0);
    const remainder = total % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

export const companySignupSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório.")
      .max(150, "Nome deve ter no máximo 150 caracteres."),
    cnpj: z
      .string()
      .trim()
      .min(1, "CNPJ é obrigatório.")
      .refine(isValidCnpj, "Insira um CNPJ válido."),
    phone: z
      .string()
      .trim()
      .min(1, "Telefone é obrigatório.")
      .refine((value) => {
        const digits = onlyDigits(value);
        return digits.length === 10 || digits.length === 11;
      }, "Digite um telefone válido."),
    email: z
      .string()
      .trim()
      .min(1, "Email é obrigatório.")
      .email("Email inválido.")
      .max(150, "Email deve ter no máximo 150 caracteres."),
    description: z
      .string()
      .trim()
      .min(1, "Descrição é obrigatório.")
      .max(500, "Descrição deve ter no máximo 500 caracteres."),
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

export type CompanySignupForm = z.infer<typeof companySignupSchema>;

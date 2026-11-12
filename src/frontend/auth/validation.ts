import { z } from 'zod';

// Mensagens em português; regras espelham os schemas de src/app/api/auth/*/route.ts.
const email = z.string().trim().min(1, 'Informe seu email').email('Email inválido');

// Mesmas regras de src/app/api/auth/reset-password/route.ts.
export const passwordRules = z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número');

export const loginSchema = z.object({
    email,
    password: z.string().min(1, 'Informe sua senha'),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
    .object({
        password: passwordRules,
        confirmPassword: z.string().min(1, 'Confirme a nova senha'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Informe seu nome completo'),
    email,
    cpfCnpj: z
        .string()
        .refine((v) => [11, 14].includes(v.replace(/\D/g, '').length), 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)'),
    phone: z.string(),
    address: z.string(),
    avgEnergyCost: z.string(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

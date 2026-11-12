import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from './validation';

const firstError = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

describe('validação de autenticação', () => {
    it('login exige email válido e senha', () => {
        expect(firstError(loginSchema.safeParse({ email: 'abc', password: 'x' }))).toBe('Email inválido');
        expect(firstError(loginSchema.safeParse({ email: 'a@b.com', password: '' }))).toBe('Informe sua senha');
        expect(loginSchema.safeParse({ email: ' a@b.com ', password: 'x' }).data?.email).toBe('a@b.com');
    });

    it('redefinição segue as regras de senha do backend e confere a confirmação', () => {
        expect(firstError(resetPasswordSchema.safeParse({ password: 'abcdefgh', confirmPassword: 'abcdefgh' })))
            .toBe('A senha deve conter pelo menos uma letra maiúscula');
        expect(firstError(resetPasswordSchema.safeParse({ password: 'Abcdefg1', confirmPassword: 'Abcdefg2' })))
            .toBe('As senhas não coincidem');
        expect(resetPasswordSchema.safeParse({ password: 'Abcdefg1', confirmPassword: 'Abcdefg1' }).success).toBe(true);
    });

    it('cadastro aceita CPF ou CNPJ com ou sem máscara', () => {
        const base = { name: 'Ana Lima', email: 'ana@x.com', phone: '', address: '', avgEnergyCost: '' };
        expect(registerSchema.safeParse({ ...base, cpfCnpj: '123.456.789-01' }).success).toBe(true);
        expect(registerSchema.safeParse({ ...base, cpfCnpj: '12.345.678/0001-90' }).success).toBe(true);
        expect(firstError(registerSchema.safeParse({ ...base, cpfCnpj: '1234' })))
            .toBe('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)');
    });
});

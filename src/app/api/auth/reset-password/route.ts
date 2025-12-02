import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { ResetPasswordUseCase } from '@/backend/auth/use-cases/reset-password.use-case';

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string()
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar dados de entrada com Zod
        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Invalid input', errors: validation.error.issues },
                { status: 400 }
            );
        }

        const { token, password } = validation.data;

        // Instanciar dependências
        const userRepository = new PrismaUserRepository(prisma);
        const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);

        // Executar Use Case
        await resetPasswordUseCase.execute({ token, newPassword: password });

        // Retornar sucesso
        return NextResponse.json(
            {
                success: true,
                message: 'Password updated successfully.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Reset password error:', error);

        // Tratar erros específicos
        if (error instanceof Error) {
            if (error.message === 'Invalid token' || error.message === 'Token expired') {
                return NextResponse.json(
                    { success: false, message: error.message },
                    { status: 400 }
                );
            }
        }

        // Erro genérico
        return NextResponse.json(
            { success: false, message: 'An error occurred while resetting the password.' },
            { status: 500 }
        );
    }
}

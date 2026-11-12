import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { ResetPasswordUseCase } from '@/backend/auth/use-cases/reset-password.use-case';
import { passwordSchema } from '@/shared/admin-users/permissions';

const resetPasswordSchema = z.object({
    token: z.string(),
    password: passwordSchema,
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

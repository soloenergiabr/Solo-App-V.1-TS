import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { ForgotPasswordUseCase } from '@/backend/auth/use-cases/forgot-password.use-case';

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar dados de entrada com Zod
        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Invalid email format', errors: validation.error.issues },
                { status: 400 }
            );
        }

        const { email } = validation.data;

        // Instanciar dependências
        const userRepository = new PrismaUserRepository(prisma);
        const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository);

        // Executar Use Case
        await forgotPasswordUseCase.execute({ email });

        // Retornar resposta genérica (por segurança, não revelar se o email existe)
        return NextResponse.json(
            {
                success: true,
                message: 'If the email exists, a recovery link has been sent.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Forgot password error:', error);

        // Por segurança, mesmo em caso de erro, retornamos a mesma mensagem genérica
        // Isso evita vazamento de informação sobre quais emails existem no sistema
        return NextResponse.json(
            {
                success: true,
                message: 'If the email exists, a recovery link has been sent.',
            },
            { status: 200 }
        );
    }
}

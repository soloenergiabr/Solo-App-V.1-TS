import { NextRequest, NextResponse } from 'next/server';
import { AuthService, LoginRequest } from '@/backend/auth/services/auth.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para login
const LoginRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// Criar instância do repositório e service
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar dados de entrada
        const validatedRequest = LoginRequestSchema.parse(body) as LoginRequest;

        // Realizar login
        const result = await authService.login(validatedRequest);

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: result,
        });

    } catch (error) {
        console.error('Login error:', error);

        // Tratar erros de validação
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'Invalid request data',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        // Tratar erros de autenticação
        if (error instanceof Error) {
            const isAuthError = error.message.includes('credentials') || 
                               error.message.includes('disabled');
            
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication failed',
                    message: error.message,
                },
                { status: isAuthError ? 401 : 500 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Login failed',
                message: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

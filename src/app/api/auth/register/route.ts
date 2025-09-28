import { NextRequest, NextResponse } from 'next/server';
import { AuthService, RegisterRequest } from '@/backend/auth/services/auth.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para registro
const RegisterRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    clientId: z.string().optional(),
});

// Criar instância do repositório e service
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar dados de entrada
        const validatedRequest = RegisterRequestSchema.parse(body) as RegisterRequest;

        // Realizar registro
        const result = await authService.register(validatedRequest);

        return NextResponse.json({
            success: true,
            message: result.message,
            data: result.user,
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);

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

        // Tratar erros específicos
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'User already exists',
                        message: 'A user with this email already exists',
                    },
                    { status: 409 }
                );
            }

            if (error.message.includes('Password must be')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Validation error',
                        message: error.message,
                    },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Registration failed',
                message: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

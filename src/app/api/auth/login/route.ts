import { NextRequest, NextResponse } from 'next/server';
import { AuthService, LoginRequest } from '@/backend/auth/services/auth.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';

// Schema de validação para login
const LoginRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// Criar instância do repositório e service
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

const loginRoute = async (request: NextRequest): Promise<NextResponse> => {
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
};

export const POST = withHandle(loginRoute);

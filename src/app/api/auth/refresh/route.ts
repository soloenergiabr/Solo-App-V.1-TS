import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/auth/services/auth.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para refresh token
const RefreshTokenRequestSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Criar instância do repositório e service
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

const refreshRoute = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();

    // Validar dados de entrada
    const { refreshToken } = RefreshTokenRequestSchema.parse(body);

    // Renovar token
    const result = await authService.refreshToken(refreshToken);

    return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
    });
};

export const POST = withHandle(refreshRoute);

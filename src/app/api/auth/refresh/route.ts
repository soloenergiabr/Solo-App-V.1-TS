import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/auth/services/auth.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para refresh token
const RefreshTokenRequestSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Criar instância do repositório e service
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

export async function POST(request: NextRequest) {
    try {
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

    } catch (error) {
        console.error('Token refresh error:', error);

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

        // Tratar erros de token
        if (error instanceof Error && error.message.includes('Invalid refresh token')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid refresh token',
                    message: 'The provided refresh token is invalid or expired',
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Token refresh failed',
                message: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

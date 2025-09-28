import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

export async function GET(request: NextRequest) {
    try {
        // Extrair contexto do usuário
        const userContext = await AuthMiddleware.requireAuth(request);

        return NextResponse.json({
            success: true,
            data: {
                id: userContext.userId,
                email: userContext.email,
                name: userContext.name,
                roles: userContext.roles,
                permissions: userContext.permissions,
                clientId: userContext.clientId,
                isAuthenticated: userContext.isAuthenticated,
            },
        });

    } catch (error) {
        console.error('Get user info error:', error);

        // Tratar erros de autenticação
        if (error instanceof Error && 
            (error.message.includes('token') || error.message.includes('Authentication'))) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication failed',
                    message: error.message,
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to get user information',
                message: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

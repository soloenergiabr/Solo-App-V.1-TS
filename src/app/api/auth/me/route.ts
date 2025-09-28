import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { withHandle } from '@/app/api/api-utils';

const getMeRoute = async (request: NextRequest): Promise<NextResponse> => {
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
};

export const GET = withHandle(getMeRoute);

import { NextRequest, NextResponse } from 'next/server';
import { JwtService } from './backend/auth/services/jwt.service';

// Rotas que não precisam de autenticação
const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/health',
    '/',
    '/login',
    '/register',
];

// Rotas que sempre precisam de autenticação
const protectedApiRoutes = [
    '/api/generation',
    '/api/auth/me',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Permitir acesso a rotas públicas
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Verificar autenticação para rotas protegidas da API
    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
        try {
            const authHeader = request.headers.get('Authorization');
            const token = JwtService.extractTokenFromHeader(authHeader);
            JwtService.verifyToken(token);

            // Token válido, continuar
            return NextResponse.next();
        } catch (error) {
            // Token inválido, retornar erro 401
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                    message: 'Valid authentication token is required to access this resource',
                },
                { status: 401 }
            );
        }
    }

    // Para outras rotas, continuar normalmente
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};

import { NextRequest, NextResponse } from 'next/server';
import { JwtService } from './backend/auth/services/jwt.service';

const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/health',
    '/',
    '/login',
    '/register',
];

const protectedApiRoutes = [
    '/api/generation',
    '/api/auth/me',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
        try {
            const authHeader = request.headers.get('Authorization');
            const token = JwtService.extractTokenFromHeader(authHeader);
            JwtService.verifyToken(token);

            return NextResponse.next();
        } catch (error) {
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

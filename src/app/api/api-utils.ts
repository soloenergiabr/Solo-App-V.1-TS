import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Tipo para funções de rota do Next.js
type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withHandle(handler: RouteHandler): RouteHandler {
    return async (request: NextRequest, context?: any) => {
        try {
            return await handler(request, context);
        } catch (error) {
            console.error('API Route error:', error);

            // Tratar erros de validação Zod
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
            if (error instanceof Error &&
                (error.message.includes('token') ||
                    error.message.includes('Authentication') ||
                    error.message.includes('credentials') ||
                    error.message.includes('permission'))) {

                const isTokenError = error.message.includes('token') || error.message.includes('Authentication');
                const status = isTokenError ? 401 : 403;

                return NextResponse.json(
                    {
                        success: false,
                        error: isTokenError ? 'Authentication failed' : 'Authorization failed',
                        message: error.message,
                    },
                    { status }
                );
            }

            // Tratar erros específicos de negócio
            if (error instanceof Error) {
                // Erros de usuário já existente, não encontrado, etc.
                if (error.message.includes('already exists')) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Conflict',
                            message: error.message,
                        },
                        { status: 409 }
                    );
                }

                if (error.message.includes('not found')) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Not found',
                            message: error.message,
                        },
                        { status: 404 }
                    );
                }

                // Outros erros de negócio
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Business logic error',
                        message: error.message,
                    },
                    { status: 400 }
                );
            }

            // Erro genérico
            return NextResponse.json(
                {
                    success: false,
                    error: 'Internal server error',
                    message: 'An unexpected error occurred',
                },
                { status: 500 }
            );
        }
    };
}
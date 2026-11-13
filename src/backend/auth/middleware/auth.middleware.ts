import { NextRequest } from 'next/server';
import { UserContextModel } from '../models/user-context.model';
import { JwtService } from '../services/jwt.service';

export interface AuthenticatedRequest extends NextRequest {
    userContext: UserContextModel;
}

const ADMIN_API_PREFIXES = ['/api/admin', '/api/club/admin'];

export function isAdminApiPath(request: Partial<Pick<NextRequest, 'nextUrl' | 'url'>>): boolean {
    const pathname = request.nextUrl?.pathname ?? (request.url ? new URL(request.url, 'http://localhost').pathname : '');
    return ADMIN_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export class AuthMiddleware {
    static async extractUserContext(request: NextRequest): Promise<UserContextModel> {
        let userContext: UserContextModel;
        try {
            const authHeader = request.headers.get('Authorization');
            const token = JwtService.extractTokenFromHeader(authHeader);

            userContext = JwtService.createUserContextFromToken(token);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }

        // Ponto unico de protecao das APIs administrativas: varias rotas so pediam login,
        // e um cliente comum conseguia listar/alterar dados de outros clientes.
        if (isAdminApiPath(request) && !userContext.hasRole('master')) {
            throw new Error('User does not have role: master');
        }

        return userContext;
    }

    static async requireAuth(request: NextRequest): Promise<UserContextModel> {
        const userContext = await this.extractUserContext(request);

        if (!userContext.isAuthenticated) {
            throw new Error('User is not authenticated');
        }

        return userContext;
    }

    static async requirePermission(
        request: NextRequest,
        permission: string
    ): Promise<UserContextModel> {
        const userContext = await this.requireAuth(request);

        if (!userContext.hasPermission(permission)) {
            throw new Error(`User does not have permission: ${permission}`);
        }

        return userContext;
    }

    static async requireRole(
        request: NextRequest,
        role: string
    ): Promise<UserContextModel> {
        const userContext = await this.requireAuth(request);

        if (!userContext.hasRole(role)) {
            throw new Error(`User does not have role: ${role}`);
        }

        return userContext;
    }
}

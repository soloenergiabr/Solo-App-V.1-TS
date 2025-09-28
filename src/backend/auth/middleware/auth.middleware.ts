import { NextRequest } from 'next/server';
import { UserContextModel } from '../models/user-context.model';
import { JwtService } from '../services/jwt.service';

export interface AuthenticatedRequest extends NextRequest {
    userContext: UserContextModel;
}

export class AuthMiddleware {
    static async extractUserContext(request: NextRequest): Promise<UserContextModel> {
        try {
            // Extrair token do header Authorization
            const authHeader = request.headers.get('Authorization');
            const token = JwtService.extractTokenFromHeader(authHeader);

            // Criar UserContext a partir do token
            return JwtService.createUserContextFromToken(token);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
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

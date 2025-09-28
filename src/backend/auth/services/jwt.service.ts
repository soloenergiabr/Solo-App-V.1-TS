import jwt from 'jsonwebtoken';
import { UserContextModel } from '../models/user-context.model';

export interface JwtPayload {
    userId: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    clientId?: string;
    iat?: number;
    exp?: number;
}

export class JwtService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    /**
     * Gera um token JWT para um usuário
     */
    static generateToken(userContext: UserContextModel): string {
        const payload: JwtPayload = {
            userId: userContext.userId,
            email: userContext.email,
            name: userContext.name,
            roles: userContext.roles,
            permissions: userContext.permissions,
            clientId: userContext.clientId,
        };

        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
            issuer: 'solo-energy-app',
            audience: 'solo-energy-users',
        } as jwt.SignOptions);
    }

    /**
     * Gera um refresh token
     */
    static generateRefreshToken(userId: string): string {
        return jwt.sign(
            { userId, type: 'refresh' },
            this.JWT_SECRET,
            {
                expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
                issuer: 'solo-energy-app',
                audience: 'solo-energy-users',
            } as jwt.SignOptions
        );
    }

    /**
     * Verifica e decodifica um token JWT
     */
    static verifyToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET, {
                issuer: 'solo-energy-app',
                audience: 'solo-energy-users',
            }) as JwtPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    /**
     * Verifica um refresh token
     */
    static verifyRefreshToken(token: string): { userId: string } {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET, {
                issuer: 'solo-energy-app',
                audience: 'solo-energy-users',
            }) as any;

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }

            return { userId: decoded.userId };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            throw new Error('Refresh token verification failed');
        }
    }

    /**
     * Extrai token do header Authorization
     */
    static extractTokenFromHeader(authHeader: string | null): string {
        console.log({
            authHeader
        });

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No valid authorization token provided');
        }
        return authHeader.substring(7); // Remove 'Bearer '
    }

    /**
     * Cria UserContext a partir de um token JWT
     */
    static createUserContextFromToken(token: string): UserContextModel {
        const payload = this.verifyToken(token);

        console.log({
            payload
        });

        return new UserContextModel(
            payload.userId,
            payload.email,
            payload.name,
            payload.roles,
            payload.permissions,
            payload.clientId,
            true
        );
    }

    /**
     * Gera tokens de acesso e refresh
     */
    static generateTokenPair(userContext: UserContextModel): {
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    } {
        return {
            accessToken: this.generateToken(userContext),
            refreshToken: this.generateRefreshToken(userContext.userId),
            expiresIn: this.JWT_EXPIRES_IN,
        };
    }

    /**
     * Verifica se um token está próximo do vencimento (últimos 15 minutos)
     */
    static isTokenNearExpiry(token: string): boolean {
        try {
            const decoded = jwt.decode(token) as JwtPayload;
            if (!decoded || !decoded.exp) return true;

            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - now;

            // Retorna true se restam menos de 15 minutos (900 segundos)
            return timeUntilExpiry < 900;
        } catch {
            return true;
        }
    }
}

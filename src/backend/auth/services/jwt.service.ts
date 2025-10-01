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

    static verifyToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET, {
                issuer: 'solo-energy-app',
                audience: 'solo-energy-users',
            }) as JwtPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

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

    static extractTokenFromHeader(authHeader: string | null): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No valid authorization token provided');
        }
        return authHeader.substring(7); // Remove 'Bearer '
    }

    static createUserContextFromToken(token: string): UserContextModel {
        const payload = this.verifyToken(token);

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

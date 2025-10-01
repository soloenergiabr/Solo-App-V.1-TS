import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { JwtService } from '../services/jwt.service';
import { UserContextModel } from '../models/user-context.model';

describe('JwtService', () => {
    let mockUserContext: UserContextModel;

    beforeEach(() => {
        vi.clearAllMocks();

        mockUserContext = new UserContextModel(
            'user_123',
            'test@example.com',
            'Test User',
            ['user'],
            ['read_inverters', 'create_inverter'],
            'client_123'
        );
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            // Act
            const token = JwtService.generateToken(mockUserContext);

            // Assert
            expect(token).toBeTruthy();
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a refresh token', () => {
            // Act
            const refreshToken = JwtService.generateRefreshToken('user_123');

            // Assert
            expect(refreshToken).toBeTruthy();
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode a valid token', () => {
            // Act
            const { accessToken } = JwtService.generateTokenPair(mockUserContext);
            const payload = JwtService.verifyToken(accessToken);

            // Assert
            expect(payload).toEqual(expect.objectContaining({
                userId: 'user_123',
                email: 'test@example.com',
                name: 'Test User',
            }));
        });

        it('should throw error for invalid token', () => {
            expect(() => JwtService.verifyToken('invalid_token')).toThrow('Invalid token');
        });

        it('should throw error for expired token', () => {
            const token = JwtService.generateToken(mockUserContext);

            vi.useFakeTimers();
            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            expect(() => JwtService.verifyToken(token)).toThrow('Token has expired');
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify a valid refresh token', () => {
            const { refreshToken } = JwtService.generateTokenPair(mockUserContext);

            // Act
            const result = JwtService.verifyRefreshToken(refreshToken);

            // Assert
            expect(result).toEqual({ userId: 'user_123' });
        });

        it('should throw error for invalid refresh token type', () => {
            expect(() => JwtService.verifyRefreshToken('invalid_type_token')).toThrow('Invalid refresh token');
        });

        it('should throw error for malformed refresh token', () => {
            expect(() => JwtService.verifyRefreshToken('malformed_token')).toThrow('Invalid refresh token');
        });
    });

    describe('extractTokenFromHeader', () => {
        it('should extract token from valid Bearer header', () => {
            // Act
            const token = JwtService.extractTokenFromHeader('Bearer valid_token_123');

            // Assert
            expect(token).toBe('valid_token_123');
        });

        it('should throw error for missing header', () => {
            expect(() => JwtService.extractTokenFromHeader(null)).toThrow('No valid authorization token provided');
        });

        it('should throw error for invalid header format', () => {
            expect(() => JwtService.extractTokenFromHeader('Invalid header')).toThrow('No valid authorization token provided');
        });

        it('should throw error for missing Bearer prefix', () => {
            expect(() => JwtService.extractTokenFromHeader('token_without_bearer')).toThrow('No valid authorization token provided');
        });
    });

    describe('createUserContextFromToken', () => {
        it('should create UserContext from valid token', () => {
            const token = JwtService.generateToken(mockUserContext);

            const userContext = JwtService.createUserContextFromToken(token);

            expect(userContext).toBeInstanceOf(UserContextModel);
            expect(userContext.userId).toBe('user_123');
            expect(userContext.email).toBe('test@example.com');
            expect(userContext.name).toBe('Test User');
            expect(userContext.roles).toEqual(['user']);
            expect(userContext.permissions).toEqual(['read_inverters', 'create_inverter']);
            expect(userContext.clientId).toBe('client_123');
            expect(userContext.isAuthenticated).toBe(true);
        });
    });

    describe('generateTokenPair', () => {
        it('should generate both access and refresh tokens', () => {
            const tokenPair = JwtService.generateTokenPair(mockUserContext);

            expect(tokenPair).toEqual({
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
                expiresIn: expect.any(String),
            });
        });
    });
});

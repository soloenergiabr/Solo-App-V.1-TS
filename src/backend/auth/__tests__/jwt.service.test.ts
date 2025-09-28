import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { JwtService } from '../services/jwt.service';
import { UserContextModel } from '../models/user-context.model';

// Mock do jsonwebtoken
vi.mock('jsonwebtoken');
const mockedJwt = jwt as any;

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

        // Setup default JWT mocks
        vi.mocked(mockedJwt.sign).mockReturnValue('mock_token');
        vi.mocked(mockedJwt.verify).mockReturnValue({
            userId: 'user_123',
            email: 'test@example.com',
            name: 'Test User',
            roles: ['user'],
            permissions: ['read_inverters', 'create_inverter'],
            clientId: 'client_123',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400,
        });
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            // Act
            const token = JwtService.generateToken(mockUserContext);

            // Assert
            expect(token).toBe('mock_token');
            expect(vi.mocked(mockedJwt.sign)).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user_123',
                    email: 'test@example.com',
                    name: 'Test User',
                    roles: ['user'],
                    permissions: ['read_inverters', 'create_inverter'],
                    clientId: 'client_123',
                }),
                expect.any(String),
                expect.objectContaining({
                    expiresIn: '24h',
                    audience: 'solo-energy-users',
                    issuer: 'solo-energy-app',
                })
            );
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a refresh token', () => {
            // Act
            const refreshToken = JwtService.generateRefreshToken('user_123');

            // Assert
            expect(refreshToken).toBe('mock_token');
            expect(vi.mocked(mockedJwt.sign)).toHaveBeenCalledWith(
                { userId: 'user_123', type: 'refresh' },
                expect.any(String),
                expect.objectContaining({
                    expiresIn: '7d',
                })
            );
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode a valid token', () => {
            // Act
            const payload = JwtService.verifyToken('valid_token');

            // Assert
            expect(payload).toEqual(expect.objectContaining({
                userId: 'user_123',
                email: 'test@example.com',
                name: 'Test User',
            }));
            expect(vi.mocked(mockedJwt.verify)).toHaveBeenCalledWith(
                'valid_token',
                expect.any(String),
                expect.objectContaining({
                    audience: 'solo-energy-users',
                    issuer: 'solo-energy-app',
                })
            );
        });

        it('should throw error for invalid token', () => {
            // Arrange
            vi.mocked(mockedJwt.verify).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Act & Assert
            expect(() => JwtService.verifyToken('invalid_token')).toThrow('Token verification failed');
        });

        it('should throw error for expired token', () => {
            // Arrange
            const expiredError = new Error('Token expired');
            expiredError.name = 'TokenExpiredError';
            vi.mocked(mockedJwt.verify).mockImplementation(() => {
                throw expiredError;
            });

            // Act & Assert
            expect(() => JwtService.verifyToken('expired_token')).toThrow('Token has expired');
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify a valid refresh token', () => {
            // Arrange
            vi.mocked(mockedJwt.verify).mockReturnValue({
                userId: 'user_123',
                type: 'refresh',
            });

            // Act
            const result = JwtService.verifyRefreshToken('valid_refresh_token');

            // Assert
            expect(result).toEqual({ userId: 'user_123' });
            expect(vi.mocked(mockedJwt.verify)).toHaveBeenCalledWith(
                'valid_refresh_token',
                expect.any(String),
                expect.objectContaining({
                    audience: 'solo-energy-users',
                    issuer: 'solo-energy-app',
                })
            );
        });

        it('should throw error for invalid refresh token type', () => {
            // Arrange
            vi.mocked(mockedJwt.verify).mockReturnValue({
                userId: 'user_123',
                type: 'access', // Wrong type
            });

            // Act & Assert
            expect(() => JwtService.verifyRefreshToken('invalid_type_token')).toThrow('Invalid refresh token');
        });

        it('should throw error for malformed refresh token', () => {
            // Arrange
            vi.mocked(mockedJwt.verify).mockImplementation(() => {
                throw new Error('Malformed token');
            });

            // Act & Assert
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
            // Act & Assert
            expect(() => JwtService.extractTokenFromHeader(null)).toThrow('No valid authorization token provided');
        });

        it('should throw error for invalid header format', () => {
            // Act & Assert
            expect(() => JwtService.extractTokenFromHeader('Invalid header')).toThrow('No valid authorization token provided');
        });

        it('should throw error for missing Bearer prefix', () => {
            // Act & Assert
            expect(() => JwtService.extractTokenFromHeader('token_without_bearer')).toThrow('No valid authorization token provided');
        });
    });

    describe('createUserContextFromToken', () => {
        it('should create UserContext from valid token', () => {
            // Act
            const userContext = JwtService.createUserContextFromToken('valid_token');

            // Assert
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
            // Arrange
            vi.mocked(mockedJwt.sign)
                .mockReturnValueOnce('access_token_123')
                .mockReturnValueOnce('refresh_token_456');

            // Act
            const tokenPair = JwtService.generateTokenPair(mockUserContext);

            // Assert
            expect(tokenPair).toEqual({
                accessToken: 'access_token_123',
                refreshToken: 'refresh_token_456',
            });
            expect(vi.mocked(mockedJwt.sign)).toHaveBeenCalledTimes(2);
        });
    });

    describe('isTokenNearExpiry', () => {
        it('should return true for token expiring soon', () => {
            // Arrange
            const soonExpiry = Math.floor(Date.now() / 1000) + 600; // 10 minutes
            vi.mocked(mockedJwt.decode).mockReturnValue({
                exp: soonExpiry,
            });

            // Act
            const isNearExpiry = JwtService.isTokenNearExpiry('token_expiring_soon');

            // Assert
            expect(isNearExpiry).toBe(true);
        });

        it('should return false for token with plenty of time', () => {
            // Arrange
            const futureExpiry = Math.floor(Date.now() / 1000) + 7200; // 2 hours
            vi.mocked(mockedJwt.decode).mockReturnValue({
                exp: futureExpiry,
            });

            // Act
            const isNearExpiry = JwtService.isTokenNearExpiry('token_with_time');

            // Assert
            expect(isNearExpiry).toBe(false);
        });

        it('should return true for invalid token', () => {
            // Arrange
            vi.mocked(mockedJwt.decode).mockReturnValue(null);

            // Act
            const isNearExpiry = JwtService.isTokenNearExpiry('invalid_token');

            // Assert
            expect(isNearExpiry).toBe(true);
        });
    });
});

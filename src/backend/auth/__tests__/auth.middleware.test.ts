import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/jwt.service';
import { UserContextModel } from '../models/user-context.model';

// Mock do JwtService
vi.mock('../services/jwt.service');
const mockedJwtService = JwtService as any;

describe('AuthMiddleware', () => {
    let mockRequest: NextRequest;
    let mockUserContext: UserContextModel;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock user context
        mockUserContext = new UserContextModel(
            'user_123',
            'test@example.com',
            'Test User',
            ['user'],
            ['read_inverters', 'create_inverter'],
            'client_123'
        );

        // Setup JwtService mocks
        vi.mocked(mockedJwtService.extractTokenFromHeader).mockReturnValue('valid_token');
        vi.mocked(mockedJwtService.createUserContextFromToken).mockReturnValue(mockUserContext);

        // Create mock NextRequest
        mockRequest = {
            headers: {
                get: vi.fn().mockReturnValue('Bearer valid_token'),
            },
        } as any;
    });

    describe('extractUserContext', () => {
        it('should extract user context from valid authorization header', async () => {
            // Act
            const result = await AuthMiddleware.extractUserContext(mockRequest);

            // Assert
            expect(result).toBe(mockUserContext);
            expect(vi.mocked(mockRequest.headers.get)).toHaveBeenCalledWith('Authorization');
            expect(vi.mocked(mockedJwtService.extractTokenFromHeader)).toHaveBeenCalledWith('Bearer valid_token');
            expect(vi.mocked(mockedJwtService.createUserContextFromToken)).toHaveBeenCalledWith('valid_token');
        });

        it('should throw error when no authorization header', async () => {
            // Arrange
            vi.mocked(mockRequest.headers.get).mockReturnValue(null);
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockImplementation(() => {
                throw new Error('No valid authorization token provided');
            });

            // Act & Assert
            await expect(AuthMiddleware.extractUserContext(mockRequest)).rejects.toThrow(
                'No valid authorization token provided'
            );
        });

        it('should throw error when invalid token format', async () => {
            // Arrange
            vi.mocked(mockRequest.headers.get).mockReturnValue('Invalid token format');
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockImplementation(() => {
                throw new Error('No valid authorization token provided');
            });

            // Act & Assert
            await expect(AuthMiddleware.extractUserContext(mockRequest)).rejects.toThrow(
                'No valid authorization token provided'
            );
        });

        it('should throw error when token verification fails', async () => {
            // Arrange
            vi.mocked(mockedJwtService.createUserContextFromToken).mockImplementation(() => {
                throw new Error('Invalid or expired token');
            });

            // Act & Assert
            await expect(AuthMiddleware.extractUserContext(mockRequest)).rejects.toThrow(
                'Invalid or expired token'
            );
        });

        it('should handle generic errors', async () => {
            // Arrange
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockImplementation(() => {
                throw new Error('Some unexpected error');
            });

            // Act & Assert
            await expect(AuthMiddleware.extractUserContext(mockRequest)).rejects.toThrow(
                'Some unexpected error'
            );
        });

        it('should handle non-Error exceptions', async () => {
            // Arrange
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockImplementation(() => {
                throw 'String error';
            });

            // Act & Assert
            await expect(AuthMiddleware.extractUserContext(mockRequest)).rejects.toThrow(
                'Authentication failed'
            );
        });
    });

    describe('requireAuth', () => {
        it('should return user context for authenticated request', async () => {
            // Act
            const result = await AuthMiddleware.requireAuth(mockRequest);

            // Assert
            expect(result).toBe(mockUserContext);
            expect(result.isAuthenticated).toBe(true);
        });

        it('should throw error for unauthenticated request', async () => {
            // Arrange
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockImplementation(() => {
                throw new Error('No valid authorization token provided');
            });

            // Act & Assert
            await expect(AuthMiddleware.requireAuth(mockRequest)).rejects.toThrow(
                'No valid authorization token provided'
            );
        });

        it('should throw error for expired token', async () => {
            // Arrange
            vi.mocked(mockedJwtService.createUserContextFromToken).mockImplementation(() => {
                throw new Error('Token has expired');
            });

            // Act & Assert
            await expect(AuthMiddleware.requireAuth(mockRequest)).rejects.toThrow(
                'Token has expired'
            );
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete authentication flow', async () => {
            // Arrange
            const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

            vi.mocked(mockRequest.headers.get).mockReturnValue(authHeader);
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockReturnValue(token);
            vi.mocked(mockedJwtService.createUserContextFromToken).mockReturnValue(mockUserContext);

            // Act
            const result = await AuthMiddleware.requireAuth(mockRequest);

            // Assert
            expect(result.userId).toBe('user_123');
            expect(result.email).toBe('test@example.com');
            expect(result.hasRole('user')).toBe(true);
            expect(result.hasPermission('read_inverters')).toBe(true);
        });

        it('should handle missing Bearer prefix', async () => {
            // Arrange
            vi.mocked(mockRequest.headers.get).mockReturnValue('token_without_bearer');
            vi.mocked(mockedJwtService.extractTokenFromHeader).mockImplementation(() => {
                throw new Error('No valid authorization token provided');
            });

            // Act & Assert
            await expect(AuthMiddleware.requireAuth(mockRequest)).rejects.toThrow(
                'No valid authorization token provided'
            );
        });

        it('should handle malformed JWT token', async () => {
            // Arrange
            vi.mocked(mockedJwtService.createUserContextFromToken).mockImplementation(() => {
                throw new Error('Invalid token format');
            });

            // Act & Assert
            await expect(AuthMiddleware.requireAuth(mockRequest)).rejects.toThrow(
                'Invalid token format'
            );
        });
    });

    describe('error propagation', () => {
        it('should preserve original error messages', async () => {
            // Arrange
            const originalError = new Error('Custom authentication error');
            vi.mocked(mockedJwtService.createUserContextFromToken).mockImplementation(() => {
                throw originalError;
            });

            // Act & Assert
            await expect(AuthMiddleware.requireAuth(mockRequest)).rejects.toThrow(
                'Custom authentication error'
            );
        });

        it('should handle JWT library specific errors', async () => {
            // Arrange
            const jwtError = new Error('JsonWebTokenError: invalid signature');
            vi.mocked(mockedJwtService.createUserContextFromToken).mockImplementation(() => {
                throw jwtError;
            });

            // Act & Assert
            await expect(AuthMiddleware.requireAuth(mockRequest)).rejects.toThrow(
                'JsonWebTokenError: invalid signature'
            );
        });
    });
});

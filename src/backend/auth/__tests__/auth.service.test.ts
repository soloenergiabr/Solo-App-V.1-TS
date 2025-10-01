import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { MockUserRepository } from './mocks/mock-user.repository';
import { User } from '../models/user.model';
import { JwtService } from '../services/jwt.service';
import { UserContextModel } from '../models/user-context.model';


describe('AuthService', () => {
    let authService: AuthService;
    let mockUserRepository: MockUserRepository;
    let mockUser: User;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Setup mock repository
        mockUserRepository = new MockUserRepository();
        authService = new AuthService(mockUserRepository);

        // Setup mock user
        mockUser = {
            id: 'user_123',
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            roles: ['user'],
            permissions: ['read_inverters', 'create_inverter'],
            clientId: 'client_123',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        };
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            await authService.register(mockUser);

            const loginRequest = {
                email: mockUser.email,
                password: mockUser.password,
            };

            const result = await authService.login(loginRequest);

            // expect(result).toEqual({
            //     user: {
            //         id: mockUser.id,
            //         email: mockUser.email,
            //         name: mockUser.name,
            //         roles: mockUser.roles,
            //         permissions: mockUser.permissions,
            //         clientId: mockUser.clientId,
            //     },
            //     accessToken: 'mock_access_token',
            //     refreshToken: 'mock_refresh_token',
            //     expiresIn: '24h',
            // });

            expect(result).toHaveProperty('user');
            expect(result.user).toHaveProperty('id');
            expect(result.user).toHaveProperty('email');
            expect(result.user).toHaveProperty('name');
            expect(result.user).toHaveProperty('roles');
            expect(result.user).toHaveProperty('permissions');
            expect(result.user).toHaveProperty('clientId');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('expiresIn');
        });

        it('should throw error for invalid email', async () => {
            // Arrange
            const loginRequest = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            // Act & Assert
            await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for inactive user', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, isActive: false };
            mockUserRepository.addUser(inactiveUser);

            const loginRequest = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Act & Assert
            await expect(authService.login(loginRequest)).rejects.toThrow('Account is disabled');
        });

        it('should throw error for invalid password', async () => {
            // Arrange
            mockUserRepository.addUser(mockUser);

            const loginRequest = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            // Act & Assert
            await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            // Arrange
            const registerRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
                clientId: 'client_456',
            };

            // Act
            const result = await authService.register(registerRequest);

            // Assert
            expect(result).toHaveProperty('user');
            expect(result.user.name).toBe(registerRequest.name);
            expect(result.user.email).toBe(registerRequest.email);
            expect(mockUserRepository.getUserCount()).toBe(1);
        });

        it('should throw error for existing user', async () => {
            // Arrange
            mockUserRepository.addUser(mockUser);

            const registerRequest = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            };

            // Act & Assert
            await expect(authService.register(registerRequest)).rejects.toThrow('User already exists');
        });

        it('should throw error for short password', async () => {
            // Arrange
            const registerRequest = {
                email: 'newuser@example.com',
                password: '123',
                name: 'New User',
            };

            // Act & Assert
            await expect(authService.register(registerRequest)).rejects.toThrow(
                'Password must be at least 8 characters long'
            );
        });
    });

    describe('refreshToken', () => {
        it('should successfully refresh token', async () => {

            await authService.register({
                email: mockUser.email,
                password: mockUser.password,
                name: mockUser.name,
                clientId: mockUser.clientId,
            })

            const { accessToken, refreshToken } = await authService.login({
                email: mockUser.email,
                password: mockUser.password,
            });

            const result = await authService.refreshToken(refreshToken);

            expect(authService.validateToken(result.accessToken)).resolves.not.toThrow();
            expect(result.accessToken).toBeDefined();
            expect(result.expiresIn).toBeDefined();
        });

        it('should throw error for invalid refresh token', async () => {
            // Act & Assert
            await expect(authService.refreshToken('invalid_token')).rejects.toThrow('Invalid refresh token');
        });

        it('should throw error for inactive user', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, isActive: false };
            mockUserRepository.addUser(inactiveUser);

            await expect(authService.login({
                email: 'test@example.com',
                password: 'password123',
            })).rejects.toThrow('Account is disabled');
        });

        it('should throw error for non-existent user', async () => {
            const token = await JwtService.generateToken(mockUser as unknown as UserContextModel);

            // Act & Assert
            await expect(authService.validateToken(token)).rejects.toThrow(
                'User not found or inactive'
            );
        });
    });

    describe('validateToken', () => {
        it('should successfully validate token', async () => {
            const mockUserContext = {
                email: 'test@example.com',
                name: 'Test User',
                roles: ['user'],
                permissions: ['read_inverters'],
                clientId: 'client_123',
                isAuthenticated: true,
            };

            await authService.register({
                ...mockUserContext,
                password: 'password123',
            });

            const { accessToken } = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });


            // Act
            const result = await authService.validateToken(accessToken);

            // Assert
            expect(result.email).toEqual(mockUserContext.email);
        });

        it('should throw error for invalid token', async () => {

            // Act & Assert
            await expect(authService.validateToken('invalid_token')).rejects.toThrow('Invalid token');
        });
    });

    describe('logout', () => {
        it('should return success message', async () => {
            // Act
            const result = await authService.logout('any_token');

            // Assert
            expect(result).toEqual({
                message: 'Logged out successfully',
            });
        });
    });
});
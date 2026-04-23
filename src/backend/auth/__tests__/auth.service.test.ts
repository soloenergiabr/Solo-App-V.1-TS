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

        const mockPrisma = {
            client: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
            indication: {
                create: vi.fn(),
            }
        };

        authService = new AuthService(mockUserRepository, mockPrisma as any);

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
            mockUserRepository.addUser(mockUser);

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
            // Mock Prisma calls
            const mockPrisma = (authService as any).prisma;
            mockPrisma.client.findUnique.mockResolvedValue(null);
            mockPrisma.client.create.mockResolvedValue({
                id: 'client_123',
                name: 'New User',
                email: 'newuser@example.com',
            });

            // Arrange
            const registerRequest = {
                email: 'newuser@example.com',
                name: 'New User',
                cpfCnpj: '00000000000',
                avgEnergyCost: 100,
            };

            // Act
            const result = await authService.register(registerRequest);

            // Assert
            expect(result).toHaveProperty('client');
            expect(result.client.name).toBe(registerRequest.name);
            expect(result.client.email).toBe(registerRequest.email);
        });

        it('should throw error for existing user', async () => {
            // Arrange
            const mockPrisma = (authService as any).prisma;
            mockPrisma.client.findUnique.mockResolvedValue({ id: 'client_123' });

            const registerRequest = {
                email: 'test@example.com',
                name: 'Test User',
                cpfCnpj: '11111111111',
                enelInvoiceFile: 'url',
            };

            // Act & Assert
            await expect(authService.register(registerRequest)).rejects.toThrow('Client with this email already exists');
        });

        it('should throw error when missing energy cost and invoice', async () => {
            // Arrange
            const registerRequest = {
                email: 'newuser@example.com',
                name: 'New User',
                cpfCnpj: '00000000000',
            };

            // Act & Assert
            await expect(authService.register(registerRequest)).rejects.toThrow(
                'Either average energy cost or ENEL invoice must be provided'
            );
        });
    });

    describe('refreshToken', () => {
        it('should successfully refresh token', async () => {

            mockUserRepository.addUser(mockUser);

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

            mockUserRepository.addUser(mockUser);

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
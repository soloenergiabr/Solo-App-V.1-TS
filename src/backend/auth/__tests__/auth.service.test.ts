import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { MockUserRepository } from './mocks/mock-user.repository';
import { User } from '../models/user.model';
import { JwtService } from '../services/jwt.service';

// Mock do bcrypt
vi.mock('bcryptjs');
const mockedBcrypt = bcrypt as any;

// Mock do JwtService
vi.mock('../services/jwt.service');
const mockedJwtService = JwtService as any;

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
            password: 'hashedPassword123',
            name: 'Test User',
            roles: ['user'],
            permissions: ['read_inverters', 'create_inverter'],
            clientId: 'client_123',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        };

        // Setup JWT mocks
        vi.mocked(mockedJwtService.generateTokenPair).mockReturnValue({
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
        });

        vi.mocked(mockedJwtService.verifyRefreshToken).mockReturnValue({
            userId: 'user_123',
        });

        vi.mocked(mockedJwtService.generateToken).mockReturnValue('new_access_token');
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange
            mockUserRepository.addUser(mockUser);
            vi.mocked(mockedBcrypt.compare).mockResolvedValue(true as never);

            const loginRequest = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Act
            const result = await authService.login(loginRequest);

            // Assert
            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    roles: mockUser.roles,
                    permissions: mockUser.permissions,
                    clientId: mockUser.clientId,
                },
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
                expiresIn: '24h',
            });

            expect(vi.mocked(mockedBcrypt.compare)).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(vi.mocked(mockedJwtService.generateTokenPair)).toHaveBeenCalled();
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
            vi.mocked(mockedBcrypt.compare).mockResolvedValue(false as never);

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
            vi.mocked(mockedBcrypt.hash).mockResolvedValue('hashedPassword123' as never);

            const registerRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
                clientId: 'client_456',
            };

            // Act
            const result = await authService.register(registerRequest);

            // Assert
            expect(result).toEqual({
                user: expect.objectContaining({
                    email: 'newuser@example.com',
                    name: 'New User',
                    roles: ['user'],
                    permissions: [
                        'read_inverters',
                        'create_inverter',
                        'read_generation_data',
                        'create_generation_unit',
                    ],
                    clientId: 'client_456',
                    isActive: true,
                }),
                message: 'User registered successfully',
            });

            expect(vi.mocked(mockedBcrypt.hash)).toHaveBeenCalledWith('password123', 12);
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
            // Arrange
            mockUserRepository.addUser(mockUser);

            // Act
            const result = await authService.refreshToken('valid_refresh_token');

            // Assert
            expect(result).toEqual({
                accessToken: 'new_access_token',
                expiresIn: '24h',
            });

            expect(vi.mocked(mockedJwtService.verifyRefreshToken)).toHaveBeenCalledWith('valid_refresh_token');
            expect(vi.mocked(mockedJwtService.generateToken)).toHaveBeenCalled();
        });

        it('should throw error for invalid refresh token', async () => {
            // Arrange
            vi.mocked(mockedJwtService.verifyRefreshToken).mockImplementation(() => {
                throw new Error('Invalid refresh token');
            });

            // Act & Assert
            await expect(authService.refreshToken('invalid_token')).rejects.toThrow('Invalid refresh token');
        });

        it('should throw error for inactive user', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, isActive: false };
            mockUserRepository.addUser(inactiveUser);

            // Act & Assert
            await expect(authService.refreshToken('valid_refresh_token')).rejects.toThrow(
                'User not found or inactive'
            );
        });

        it('should throw error for non-existent user', async () => {
            // Arrange
            // No user added to repository

            // Act & Assert
            await expect(authService.refreshToken('valid_refresh_token')).rejects.toThrow(
                'User not found or inactive'
            );
        });
    });

    describe('validateToken', () => {
        it('should successfully validate token', async () => {
            // Arrange
            const mockUserContext = {
                userId: 'user_123',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['user'],
                permissions: ['read_inverters'],
                clientId: 'client_123',
                isAuthenticated: true,
            };

            vi.mocked(mockedJwtService.createUserContextFromToken).mockReturnValue(mockUserContext as any);

            // Act
            const result = await authService.validateToken('valid_token');

            // Assert
            expect(result).toEqual(mockUserContext);
            expect(vi.mocked(mockedJwtService.createUserContextFromToken)).toHaveBeenCalledWith('valid_token');
        });

        it('should throw error for invalid token', async () => {
            // Arrange
            vi.mocked(mockedJwtService.createUserContextFromToken).mockImplementation(() => {
                throw new Error('Invalid token');
            });

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
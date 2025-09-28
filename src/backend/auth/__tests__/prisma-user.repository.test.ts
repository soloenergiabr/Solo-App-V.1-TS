import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { User } from '../models/user.model';

// Mock do Prisma Client
const mockPrismaClient = {
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
    },
};

describe('PrismaUserRepository', () => {
    let repository: PrismaUserRepository;
    let mockUser: User;

    beforeEach(() => {
        vi.clearAllMocks();
        repository = new PrismaUserRepository(mockPrismaClient as any);

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
    });

    describe('findByEmail', () => {
        it('should find user by email', async () => {
            // Arrange
            const prismaUser = {
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                name: mockUser.name,
                roles: JSON.stringify(mockUser.roles),
                permissions: JSON.stringify(mockUser.permissions),
                clientId: mockUser.clientId,
                isActive: mockUser.isActive,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            };

            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(prismaUser);

            // Act
            const result = await repository.findByEmail('test@example.com');

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });

        it('should return null when user not found', async () => {
            // Arrange
            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(null);

            // Act
            const result = await repository.findByEmail('nonexistent@example.com');

            // Assert
            expect(result).toBeNull();
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'nonexistent@example.com' },
            });
        });

        it('should handle user without clientId', async () => {
            // Arrange
            const prismaUser = {
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                name: mockUser.name,
                roles: JSON.stringify(mockUser.roles),
                permissions: JSON.stringify(mockUser.permissions),
                clientId: null,
                isActive: mockUser.isActive,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            };

            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(prismaUser);

            // Act
            const result = await repository.findByEmail('test@example.com');

            // Assert
            expect(result?.clientId).toBeUndefined();
        });

        it('should parse JSON fields correctly', async () => {
            // Arrange
            const complexRoles = ['user', 'admin', 'moderator'];
            const complexPermissions = ['read_all', 'write_all', 'delete_all', 'manage_users'];

            const prismaUser = {
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                name: mockUser.name,
                roles: JSON.stringify(complexRoles),
                permissions: JSON.stringify(complexPermissions),
                clientId: mockUser.clientId,
                isActive: mockUser.isActive,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            };

            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(prismaUser);

            // Act
            const result = await repository.findByEmail('test@example.com');

            // Assert
            expect(result?.roles).toEqual(complexRoles);
            expect(result?.permissions).toEqual(complexPermissions);
        });
    });

    describe('findById', () => {
        it('should find user by id', async () => {
            // Arrange
            const prismaUser = {
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                name: mockUser.name,
                roles: JSON.stringify(mockUser.roles),
                permissions: JSON.stringify(mockUser.permissions),
                clientId: mockUser.clientId,
                isActive: mockUser.isActive,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            };

            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(prismaUser);

            // Act
            const result = await repository.findById('user_123');

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user_123' },
            });
        });

        it('should return null when user not found by id', async () => {
            // Arrange
            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(null);

            // Act
            const result = await repository.findById('nonexistent_id');

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
            // Arrange
            const userData = {
                email: 'newuser@example.com',
                password: 'hashedPassword456',
                name: 'New User',
                roles: ['user'],
                permissions: ['read_inverters'],
                clientId: 'client_456',
                isActive: true,
            };

            const createdPrismaUser = {
                id: 'user_456',
                ...userData,
                roles: JSON.stringify(userData.roles),
                permissions: JSON.stringify(userData.permissions),
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            };

            const expectedUser: User = {
                id: 'user_456',
                ...userData,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            };

            vi.mocked(mockPrismaClient.user.create).mockResolvedValue(createdPrismaUser);

            // Act
            const result = await repository.create(userData);

            // Assert
            expect(result).toEqual(expectedUser);
            expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    roles: JSON.stringify(userData.roles),
                    permissions: JSON.stringify(userData.permissions),
                    clientId: userData.clientId,
                    isActive: userData.isActive,
                },
            });
        });

        it('should create user without clientId', async () => {
            // Arrange
            const userData = {
                email: 'newuser@example.com',
                password: 'hashedPassword456',
                name: 'New User',
                roles: ['user'],
                permissions: ['read_inverters'],
                isActive: true,
            };

            const createdPrismaUser = {
                id: 'user_456',
                ...userData,
                roles: JSON.stringify(userData.roles),
                permissions: JSON.stringify(userData.permissions),
                clientId: null,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            };

            vi.mocked(mockPrismaClient.user.create).mockResolvedValue(createdPrismaUser);

            // Act
            const result = await repository.create(userData);

            // Assert
            expect(result.clientId).toBeUndefined();
            expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    roles: JSON.stringify(userData.roles),
                    permissions: JSON.stringify(userData.permissions),
                    clientId: undefined,
                    isActive: userData.isActive,
                },
            });
        });

        it('should handle empty arrays for roles and permissions', async () => {
            // Arrange
            const userData = {
                email: 'newuser@example.com',
                password: 'hashedPassword456',
                name: 'New User',
                roles: [],
                permissions: [],
                isActive: true,
            };

            const createdPrismaUser = {
                id: 'user_456',
                ...userData,
                roles: JSON.stringify([]),
                permissions: JSON.stringify([]),
                clientId: null,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            };

            vi.mocked(mockPrismaClient.user.create).mockResolvedValue(createdPrismaUser);

            // Act
            const result = await repository.create(userData);

            // Assert
            expect(result.roles).toEqual([]);
            expect(result.permissions).toEqual([]);
        });
    });

    describe('error handling', () => {
        it('should handle Prisma errors in findByEmail', async () => {
            // Arrange
            const prismaError = new Error('Database connection failed');
            vi.mocked(mockPrismaClient.user.findUnique).mockRejectedValue(prismaError);

            // Act & Assert
            await expect(repository.findByEmail('test@example.com')).rejects.toThrow(
                'Database connection failed'
            );
        });

        it('should handle Prisma errors in create', async () => {
            // Arrange
            const userData = {
                email: 'newuser@example.com',
                password: 'hashedPassword456',
                name: 'New User',
                roles: ['user'],
                permissions: ['read_inverters'],
                isActive: true,
            };

            const prismaError = new Error('Unique constraint violation');
            vi.mocked(mockPrismaClient.user.create).mockRejectedValue(prismaError);

            // Act & Assert
            await expect(repository.create(userData)).rejects.toThrow(
                'Unique constraint violation'
            );
        });

        it('should handle JSON parsing errors', async () => {
            // Arrange
            const prismaUser = {
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                name: mockUser.name,
                roles: 'invalid json',
                permissions: 'invalid json',
                clientId: mockUser.clientId,
                isActive: mockUser.isActive,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            };

            vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(prismaUser);

            // Act & Assert
            await expect(repository.findByEmail('test@example.com')).rejects.toThrow();
        });
    });
});

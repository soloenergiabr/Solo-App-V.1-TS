import { PrismaClient } from '@prisma/client/extension';
import { User } from '../models/user.model';
import { UserRepository } from './user.repository';

export class PrismaUserRepository implements UserRepository {
    constructor(private prisma: PrismaClient) { }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            clientId: user.clientId || undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            clientId: user.clientId || undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                name: userData.name,
                roles: userData.roles,
                permissions: userData.permissions,
                clientId: userData.clientId,
                isActive: userData.isActive,
            },
        });

        return {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            clientId: user.clientId || undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async update(user: Partial<User>): Promise<User> {
        if (!user.id) throw new Error('User ID is required for update');

        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
                roles: user.roles, // Assuming 'roles' from original model
                permissions: user.permissions, // Assuming 'permissions' from original model
                clientId: user.clientId,
                isActive: user.isActive,
                updatedAt: new Date(),
            },
        });

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            password: updatedUser.password,
            roles: updatedUser.roles,
            permissions: updatedUser.permissions,
            clientId: updatedUser.clientId || undefined,
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            roles: user.roles,
            permissions: user.permissions,
            clientId: user.clientId || undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}

import { PrismaClient } from '@prisma/client/extension';
import { UserRepository, User } from '../services/auth.service';

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
}

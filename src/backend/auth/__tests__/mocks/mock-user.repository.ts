import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../models/user.model';

export class MockUserRepository implements UserRepository {
    private users: User[] = [];

    constructor(initialUsers: User[] = []) {
        this.users = [...initialUsers];
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email === email) || null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find(user => user.id === id) || null;
    }

    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const user: User = {
            ...userData,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.users.push(user);
        return user;
    }

    // Helper methods for testing
    clear(): void {
        this.users = [];
    }

    addUser(user: User): void {
        this.users.push(user);
    }

    getAllUsers(): User[] {
        return [...this.users];
    }

    getUserCount(): number {
        return this.users.length;
    }

    async update(user: Partial<User>): Promise<User> {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index === -1) {
            throw new Error('User not found');
        }
        this.users[index] = {
            ...this.users[index],
            ...user,
        };
        return this.users[index];
    }
}

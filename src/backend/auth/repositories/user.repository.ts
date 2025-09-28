import { User } from "../models/user.model";

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    findById(id: string): Promise<User | null>;
}

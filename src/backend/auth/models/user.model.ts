export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    roles: string[];
    permissions: string[];
    clientId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
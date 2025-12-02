export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    roles: string[];
    permissions: string[];
    clientId?: string;
    isActive: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
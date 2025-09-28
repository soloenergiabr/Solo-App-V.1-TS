export interface UserContext {
    userId: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    clientId?: string;
    isAuthenticated: boolean;
    hasPermission(permission: string): boolean;
    hasRole(role: string): boolean;
    canAccessInverter(inverterId: string): boolean;
}

export class UserContextModel implements UserContext {
    constructor(
        public userId: string,
        public email: string,
        public name: string,
        public roles: string[] = [],
        public permissions: string[] = [],
        public clientId?: string,
        public isAuthenticated: boolean = true
    ) { }

    public hasRole(role: string): boolean {
        return this.roles.includes(role);
    }

    public hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    public canAccessInverter(inverterId: string): boolean {
        return true;
    }
}

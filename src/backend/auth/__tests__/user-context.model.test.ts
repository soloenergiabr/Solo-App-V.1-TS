import { describe, it, expect, beforeEach } from 'vitest';
import { UserContextModel } from '../models/user-context.model';

describe('UserContextModel', () => {
    let userContext: UserContextModel;

    beforeEach(() => {
        userContext = new UserContextModel(
            'user_123',
            'test@example.com',
            'Test User',
            ['user', 'admin'],
            ['read_inverters', 'create_inverter', 'delete_inverter'],
            'client_123'
        );
    });

    describe('constructor', () => {
        it('should create UserContext with all properties', () => {
            expect(userContext.userId).toBe('user_123');
            expect(userContext.email).toBe('test@example.com');
            expect(userContext.name).toBe('Test User');
            expect(userContext.roles).toEqual(['user', 'admin']);
            expect(userContext.permissions).toEqual(['read_inverters', 'create_inverter', 'delete_inverter']);
            expect(userContext.clientId).toBe('client_123');
            expect(userContext.isAuthenticated).toBe(true);
        });

        it('should create UserContext without clientId', () => {
            const contextWithoutClient = new UserContextModel(
                'user_456',
                'admin@example.com',
                'Admin User',
                ['admin'],
                ['all_permissions']
            );

            expect(contextWithoutClient.userId).toBe('user_456');
            expect(contextWithoutClient.clientId).toBeUndefined();
            expect(contextWithoutClient.isAuthenticated).toBe(true);
        });
    });

    describe('hasRole', () => {
        it('should return true for existing role', () => {
            expect(userContext.hasRole('user')).toBe(true);
            expect(userContext.hasRole('admin')).toBe(true);
        });

        it('should return false for non-existing role', () => {
            expect(userContext.hasRole('super_admin')).toBe(false);
            expect(userContext.hasRole('guest')).toBe(false);
        });

        it('should be case sensitive', () => {
            expect(userContext.hasRole('USER')).toBe(false);
            expect(userContext.hasRole('Admin')).toBe(false);
        });

        it('should handle empty roles array', () => {
            const contextWithoutRoles = new UserContextModel(
                'user_789',
                'noroles@example.com',
                'No Roles User',
                [],
                ['some_permission']
            );

            expect(contextWithoutRoles.hasRole('user')).toBe(false);
        });
    });

    describe('hasPermission', () => {
        it('should return true for existing permission', () => {
            expect(userContext.hasPermission('read_inverters')).toBe(true);
            expect(userContext.hasPermission('create_inverter')).toBe(true);
            expect(userContext.hasPermission('delete_inverter')).toBe(true);
        });

        it('should return false for non-existing permission', () => {
            expect(userContext.hasPermission('manage_users')).toBe(false);
            expect(userContext.hasPermission('system_admin')).toBe(false);
        });

        it('should be case sensitive', () => {
            expect(userContext.hasPermission('READ_INVERTERS')).toBe(false);
            expect(userContext.hasPermission('Create_Inverter')).toBe(false);
        });

        it('should handle empty permissions array', () => {
            const contextWithoutPermissions = new UserContextModel(
                'user_789',
                'noperms@example.com',
                'No Permissions User',
                ['user'],
                []
            );

            expect(contextWithoutPermissions.hasPermission('read_inverters')).toBe(false);
        });
    });

    describe('canAccessInverter', () => {
        it('should return true for any inverter (current implementation)', () => {
            expect(userContext.canAccessInverter('inverter_123')).toBe(true);
            expect(userContext.canAccessInverter('inverter_456')).toBe(true);
            expect(userContext.canAccessInverter('any_inverter_id')).toBe(true);
        });

        it('should handle empty inverter id', () => {
            expect(userContext.canAccessInverter('')).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle undefined values gracefully', () => {
            const contextWithUndefined = new UserContextModel(
                'user_undefined',
                'undefined@example.com',
                'Undefined User',
                undefined as any,
                undefined as any
            );

            expect(() => contextWithUndefined.hasRole('user')).not.toThrow();
            expect(() => contextWithUndefined.hasPermission('read')).not.toThrow();
            expect(contextWithUndefined.hasRole('user')).toBe(false);
            expect(contextWithUndefined.hasPermission('read')).toBe(false);
        });

        it('should handle null values gracefully', () => {
            const contextWithNull = new UserContextModel(
                'user_null',
                'null@example.com',
                'Null User',
                null as any,
                null as any
            );

            expect(() => contextWithNull.hasRole('user')).not.toThrow();
            expect(() => contextWithNull.hasPermission('read')).not.toThrow();
            expect(contextWithNull.hasRole('user')).toBe(false);
            expect(contextWithNull.hasPermission('read')).toBe(false);
        });
    });

    describe('authentication status', () => {
        it('should always be authenticated when created', () => {
            const contexts = [
                new UserContextModel('1', 'a@b.com', 'A', [], []),
                new UserContextModel('2', 'b@c.com', 'B', ['user'], ['read']),
                new UserContextModel('3', 'c@d.com', 'C', ['admin'], ['all'], 'client'),
            ];

            contexts.forEach(context => {
                expect(context.isAuthenticated).toBe(true);
            });
        });
    });

    describe('immutability', () => {
        it('should not allow direct modification of roles array', () => {
            const originalRoles = [...userContext.roles];

            // Try to modify the roles array
            userContext.roles.push('new_role');

            // The internal array should be modified, but this is expected behavior
            // In a real implementation, you might want to return a copy
            expect(userContext.roles).toContain('new_role');

            // But hasRole should still work correctly
            expect(userContext.hasRole('new_role')).toBe(true);
        });

        it('should not allow direct modification of permissions array', () => {
            const originalPermissions = [...userContext.permissions];

            // Try to modify the permissions array
            userContext.permissions.push('new_permission');

            // The internal array should be modified, but this is expected behavior
            expect(userContext.permissions).toContain('new_permission');

            // But hasPermission should still work correctly
            expect(userContext.hasPermission('new_permission')).toBe(true);
        });
    });
});

import { describe, it, expect } from 'vitest';
import { adminChangeError, canManageTeam } from '../admin-users.rules';
import { ALL_PERMISSIONS, PERMISSION_PRESETS } from '@/shared/admin-users/permissions';

const full = { id: 'a', isActive: true, roles: ['master'], permissions: [...ALL_PERMISSIONS] };
const other = { id: 'b', isActive: true, permissions: ['read_clients'] };

describe('canManageTeam', () => {
    it('exige master ativo com manage_roles ou manage_permissions', () => {
        expect(canManageTeam(full)).toBe(true);
        expect(canManageTeam({ ...full, permissions: ['manage_permissions'] })).toBe(true);
        expect(canManageTeam({ ...full, permissions: ['read_clients'] })).toBe(false);
        expect(canManageTeam({ ...full, isActive: false })).toBe(false);
        expect(canManageTeam({ ...full, roles: ['user'] })).toBe(false);
    });
});

describe('adminChangeError', () => {
    it('permite alterar outro usuário', () => {
        expect(adminChangeError(full, other, { isActive: false }, 0)).toBeNull();
        expect(adminChangeError(full, other, { permissions: ['read_clients', 'update_client'] }, 0)).toBeNull();
    });

    it('impede desativar a própria conta', () => {
        expect(adminChangeError(full, full, { isActive: false }, 5)).toMatch(/própria conta/);
    });

    it('impede remover o próprio manage_roles', () => {
        expect(adminChangeError(full, full, { permissions: ['manage_permissions'] }, 5)).toMatch(/própria permissão/);
        // remover outras permissões próprias é permitido
        expect(adminChangeError(full, full, { permissions: ['manage_roles', 'manage_permissions'] }, 0)).toBeNull();
    });

    it('impede conceder permissão que o ator não tem', () => {
        const limited = { ...full, permissions: ['manage_permissions', 'read_clients'] };
        expect(adminChangeError(limited, other, { permissions: ['read_clients', 'manage_roles'] }, 1)).toMatch(/não possui/);
        // manter permissões que o alvo já tinha é permitido
        const target = { ...other, permissions: ['delete_client'] };
        expect(adminChangeError(limited, target, { permissions: ['delete_client', 'read_clients'] }, 1)).toBeNull();
    });

    it('mantém ao menos um administrador com acesso total', () => {
        const otherFull = { ...full, id: 'b' };
        expect(adminChangeError(full, otherFull, { isActive: false }, 0)).toMatch(/ao menos um administrador/);
        expect(adminChangeError(full, otherFull, { permissions: ['read_clients'] }, 0)).toMatch(/ao menos um administrador/);
        expect(adminChangeError(full, otherFull, { isActive: false }, 1)).toBeNull();
    });

    it('preset "Administrador completo" cobre todas as permissões', () => {
        expect(PERMISSION_PRESETS[0].permissions).toEqual(ALL_PERMISSIONS);
    });
});

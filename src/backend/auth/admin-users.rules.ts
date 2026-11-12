import { isFullAdmin, MANAGE_PERMISSIONS } from '@/shared/admin-users/permissions';

interface AdminUserState {
    id: string;
    isActive: boolean;
    roles: string[];
    permissions: string[];
}

/** Só um master ativo com manage_roles ou manage_permissions gere a equipe. */
export function canManageTeam(user: AdminUserState): boolean {
    return user.isActive && user.roles.includes('master') && MANAGE_PERMISSIONS.some((p) => user.permissions.includes(p));
}

/**
 * Valida uma alteração de `actor` sobre `target`. Retorna a mensagem de erro ou null.
 * `otherFullAdmins` = masters ativos com acesso total à equipe, sem contar o `target`.
 */
export function adminChangeError(
    actor: AdminUserState,
    target: Omit<AdminUserState, 'roles'>,
    change: { isActive?: boolean; permissions?: string[] },
    otherFullAdmins: number,
): string | null {
    const isSelf = actor.id === target.id;
    const next = {
        isActive: change.isActive ?? target.isActive,
        permissions: change.permissions ?? target.permissions,
    };

    if (isSelf && !next.isActive) {
        return 'Você não pode desativar a sua própria conta.';
    }
    if (isSelf && target.permissions.includes('manage_roles') && !next.permissions.includes('manage_roles')) {
        return 'Você não pode remover a sua própria permissão de gerenciar a equipe.';
    }
    // Evita escalonamento: ninguém concede o que não tem.
    if (next.permissions.some((p) => !target.permissions.includes(p) && !actor.permissions.includes(p))) {
        return 'Você não pode conceder permissões que você não possui.';
    }
    if (isFullAdmin(target) && !isFullAdmin(next) && otherFullAdmins === 0) {
        return 'É preciso manter ao menos um administrador ativo com acesso total à equipe.';
    }
    return null;
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { canManageTeam } from '@/backend/auth/admin-users.rules';

/** Campos devolvidos ao front: nunca a senha nem tokens de reset. */
export const ADMIN_USER_SELECT = {
    id: true,
    name: true,
    email: true,
    isActive: true,
    roles: true,
    permissions: true,
    createdAt: true,
} as const;

/**
 * Lê o usuário logado do banco (não do JWT) para que desativação e perda de
 * permissão valham na hora. Retorna o ator ou uma resposta 403.
 */
export async function requireTeamManager(request: NextRequest) {
    const { userId } = await AuthMiddleware.requireAuth(request);
    const actor = await prisma.user.findUnique({ where: { id: userId }, select: ADMIN_USER_SELECT });
    if (!actor || !canManageTeam(actor)) {
        return {
            actor: null,
            denied: NextResponse.json(
                { success: false, message: 'Você não tem permissão para gerenciar a equipe administrativa.' },
                { status: 403 },
            ),
        };
    }
    return { actor, denied: null };
}

export function badRequest(message: string, status = 400) {
    return NextResponse.json({ success: false, message }, { status });
}

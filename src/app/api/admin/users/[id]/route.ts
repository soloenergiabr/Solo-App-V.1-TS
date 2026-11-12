import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { adminChangeError } from '@/backend/auth/admin-users.rules';
import { ALL_PERMISSIONS, isFullAdmin, type Permission } from '@/shared/admin-users/permissions';
import { ADMIN_USER_SELECT, badRequest, requireTeamManager } from '../team-manager';

const updateSchema = z.object({
    isActive: z.boolean().optional(),
    permissions: z.array(z.enum(ALL_PERMISSIONS as [Permission, ...Permission[]])).optional(),
});

const updateUser = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { actor, denied } = await requireTeamManager(request);
    if (denied) return denied;

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos');
    const change = {
        ...parsed.data,
        permissions: parsed.data.permissions && [...new Set(parsed.data.permissions)],
    };

    const { id } = await params;
    const masters = await prisma.user.findMany({
        where: { roles: { has: 'master' } },
        select: { id: true, isActive: true, permissions: true },
    });
    const target = masters.find((m) => m.id === id);
    if (!target) return badRequest('Usuário administrativo não encontrado.', 404);

    // shortcut: contagem fora de transação; duas remoções simultâneas podem passar. Suficiente para equipe pequena.
    const otherFullAdmins = masters.filter((m) => m.id !== id && isFullAdmin(m)).length;
    const error = adminChangeError(actor, target, change, otherFullAdmins);
    if (error) return badRequest(error, 403);

    const user = await prisma.user.update({
        where: { id },
        data: change,
        select: ADMIN_USER_SELECT,
    });
    return NextResponse.json({ success: true, data: user });
};

export const PATCH = withHandle(updateUser);
